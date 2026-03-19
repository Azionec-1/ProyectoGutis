import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    });

    const stockData = products.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      totalValue: Number(product.price) * product.stock,
    }));

    const summary = {
      totalProducts: products.length,
      totalStock: stockData.reduce((sum, p) => sum + p.stock, 0),
      totalValue: stockData.reduce((sum, p) => sum + p.totalValue, 0),
      lowStock: stockData.filter(p => p.stock < 10).length,
    };

    return NextResponse.json({
      summary,
      products: stockData,
    });
  } catch (error) {
    console.error('Error fetching stock report:', error);
    return NextResponse.json({ message: 'Error al obtener el reporte de stock' }, { status: 500 });
  }
}