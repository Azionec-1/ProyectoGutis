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

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { fullName: "asc" }
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("Error al obtener repartidores:", error);
    return NextResponse.json({ message: "Error al obtener repartidores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = workerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.create({
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        documentId: parsed.data.documentId,
        vehicleNote: parsed.data.vehicleNote || null,
        isActive: parsed.data.isActive
      }
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error("Error al crear repartidor:", error);
    return NextResponse.json({ message: "Error al crear repartidor" }, { status: 500 });
  }
}
