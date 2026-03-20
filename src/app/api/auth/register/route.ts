import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const RegisterSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio."),
  phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos."),
  documentId: z.string().min(1, "El documento es obligatorio."),
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.")
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { fullName, phone, documentId, email, password } = RegisterSchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El correo ya está registrado." }, { status: 409 });
    }

    const existingWorker = await prisma.worker.findUnique({ where: { documentId } });
    if (existingWorker) {
      return NextResponse.json({ error: "El documento ya está registrado." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const worker = await tx.worker.create({
        data: {
          fullName,
          phone,
          documentId,
          isActive: true
        }
      });

      await tx.user.create({
        data: {
          email,
          passwordHash,
          name: fullName,
          role: "WORKER",
          workerId: worker.id,
          isApproved: false,
          approvedAt: null
        }
      });
    });

    return NextResponse.json({
      message: "Cuenta creada correctamente. Esperando que se verifique la cuenta."
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((issue) => issue.message).join(", ") },
        { status: 400 }
      );
    }

    console.error(error);
    return NextResponse.json({ error: "Error en el servidor." }, { status: 500 });
  }
}
