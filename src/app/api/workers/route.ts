import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const workerSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio."),
  phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos."),
  documentId: z.string().min(1, "El documento es obligatorio."),
  vehicleNote: z.string().optional(),
  isActive: z.boolean().default(true),
  accountEmail: z.string().email("Ingresa un correo válido.").optional().or(z.literal("")),
  accountPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").optional().or(z.literal(""))
});

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { fullName: "asc" },
      include: {
        user: {
          select: {
            email: true,
            isApproved: true,
            approvedAt: true
          }
        }
      }
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("Error al obtener repartidores:", error);
    return NextResponse.json({ message: "Error al obtener repartidores." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = workerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos.", errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { accountEmail, accountPassword, ...workerData } = parsed.data;

    if (accountEmail && !accountPassword) {
      return NextResponse.json(
        { message: "Si asignas un correo al repartidor, también debes definir una contraseña." },
        { status: 400 }
      );
    }

    const worker = await prisma.$transaction(async (tx) => {
      const createdWorker = await tx.worker.create({
        data: {
          fullName: workerData.fullName,
          phone: workerData.phone,
          documentId: workerData.documentId,
          vehicleNote: workerData.vehicleNote || null,
          isActive: workerData.isActive
        }
      });

      if (accountEmail && accountPassword) {
        const existingUser = await tx.user.findUnique({ where: { email: accountEmail } });
        if (existingUser) {
          throw new Error("El correo de acceso ya está registrado.");
        }

        const passwordHash = await hashPassword(accountPassword);
        await tx.user.create({
          data: {
            email: accountEmail,
            passwordHash,
            name: createdWorker.fullName,
            role: "WORKER",
            workerId: createdWorker.id,
            isApproved: true,
            approvedAt: new Date()
          }
        });
      }

      return createdWorker;
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Error al crear repartidor:", error);
    return NextResponse.json({ message: "Error al crear repartidor." }, { status: 500 });
  }
}
