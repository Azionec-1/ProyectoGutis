import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!worker) {
      return NextResponse.json({ message: "Repartidor no encontrado." }, { status: 404 });
    }

    if (!worker.user) {
      return NextResponse.json({ message: "El repartidor no tiene una cuenta registrada." }, { status: 400 });
    }

    if (worker.user.isApproved) {
      return NextResponse.json({ message: "La cuenta ya fue aprobada." });
    }

    await prisma.user.update({
      where: { id: worker.user.id },
      data: {
        isApproved: true,
        approvedAt: new Date()
      }
    });

    return NextResponse.json({ message: "Cuenta aprobada correctamente." });
  } catch (error) {
    console.error("Error al aprobar la cuenta del repartidor:", error);
    return NextResponse.json({ message: "Error al aprobar la cuenta." }, { status: 500 });
  }
}
