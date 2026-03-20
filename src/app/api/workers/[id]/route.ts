import { Prisma } from "@prisma/client";
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isApproved: true
          }
        }
      }
    });

    if (!worker) {
      return NextResponse.json({ message: "Repartidor no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      ...worker,
      accountEmail: worker.user?.email ?? ""
    });
  } catch (error) {
    console.error("Error al obtener repartidor:", error);
    return NextResponse.json({ message: "Error al obtener repartidor." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = workerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos.", errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { accountEmail, accountPassword, ...workerData } = parsed.data;

    const worker = await prisma.$transaction(async (tx) => {
      const updatedWorker = await tx.worker.update({
        where: { id },
        data: {
          fullName: workerData.fullName,
          phone: workerData.phone,
          documentId: workerData.documentId,
          vehicleNote: workerData.vehicleNote || null,
          isActive: workerData.isActive
        },
        include: {
          user: true
        }
      });

      if (accountEmail) {
        const existingUserWithEmail = await tx.user.findFirst({
          where: {
            email: accountEmail,
            NOT: { workerId: id }
          }
        });

        if (existingUserWithEmail) {
          throw new Error("El correo de acceso ya está registrado.");
        }

        if (updatedWorker.user) {
          await tx.user.update({
            where: { id: updatedWorker.user.id },
            data: {
              email: accountEmail,
              name: workerData.fullName,
              passwordHash: accountPassword ? await hashPassword(accountPassword) : undefined
            }
          });
        } else {
          if (!accountPassword) {
            throw new Error("Para crear el acceso del repartidor debes definir una contraseña.");
          }

          await tx.user.create({
            data: {
              email: accountEmail,
              passwordHash: await hashPassword(accountPassword),
              name: workerData.fullName,
              role: "WORKER",
              workerId: id,
              isApproved: true,
              approvedAt: new Date()
            }
          });
        }
      }

      return updatedWorker;
    });

    return NextResponse.json(worker);
  } catch (error: unknown) {
    console.error("Error al actualizar repartidor:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Repartidor no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Error al actualizar repartidor." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({
        where: { workerId: id }
      });

      await tx.worker.delete({
        where: { id }
      });
    });

    return NextResponse.json({ message: "Repartidor eliminado correctamente." });
  } catch (error: unknown) {
    console.error("Error al eliminar repartidor:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Repartidor no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Error al eliminar repartidor." }, { status: 500 });
  }
}
