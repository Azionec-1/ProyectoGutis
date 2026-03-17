import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const workerSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio"),
  phone: z
    .string()
    .regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos."),
  documentId: z.string().min(1, "El documento es obligatorio"),
  vehicleNote: z.string().optional(),
  isActive: z.boolean().default(true)
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const worker = await prisma.worker.findUnique({
      where: { id }
    });

    if (!worker) {
      return NextResponse.json({ message: "Repartidor no encontrado" }, { status: 404 });
    }

    return NextResponse.json(worker);
  } catch (error) {
    console.error("Error al obtener repartidor:", error);
    return NextResponse.json({ message: "Error al obtener repartidor" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = workerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        documentId: parsed.data.documentId,
        vehicleNote: parsed.data.vehicleNote || null,
        isActive: parsed.data.isActive
      }
    });

    return NextResponse.json(worker);
  } catch (error: unknown) {
    console.error("Error al actualizar repartidor:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Repartidor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Error al actualizar repartidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.worker.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Repartidor eliminado correctamente" });
  } catch (error: unknown) {
    console.error("Error al eliminar repartidor:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Repartidor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Error al eliminar repartidor" }, { status: 500 });
  }
}
