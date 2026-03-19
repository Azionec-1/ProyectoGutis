import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";

export async function GET() {
  try {
    const [clients, workers, products, sales] = await Promise.all([
      prisma.client.findMany({
        where: { isActive: true },
        orderBy: { fullName: "asc" },
        select: { id: true, code: true, fullName: true },
        take: 3
      }),
      prisma.worker.findMany({
        where: { isActive: true },
        orderBy: { fullName: "asc" },
        select: { id: true, fullName: true },
        take: 2
      }),
      prisma.product.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, price: true, stock: true },
        take: 3
      }),
      prisma.sale.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalAmount: true,
          client: { select: { fullName: true } }
        },
        take: 3
      })
    ]);

    return NextResponse.json({
      clients,
      workers,
      products,
      sales: sales.map(s => ({ id: s.id, clientName: s.client.fullName, totalAmount: Number(s.totalAmount) })),
      reports: [
        "Resumen de ventas diarias",
        "Ventas por producto",
        "Ventas por repartidor"
      ]
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({
        clients: [],
        workers: [],
        products: [],
        sales: [],
        reports: []
      });
    }
    console.error("Error fetching examples:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}