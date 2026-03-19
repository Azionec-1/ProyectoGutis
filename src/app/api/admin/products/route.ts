import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  price: z.coerce.number().nonnegative('El precio no puede ser negativo'),
  stock: z.coerce.number().int('La cantidad debe ser un número entero').nonnegative('La cantidad no puede ser negativa'),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = productSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, price, stock } = parsed.data;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        stock,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return NextResponse.json({ message: 'Error al crear el producto' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return NextResponse.json({ message: 'Error al obtener los productos' }, { status: 500 });
  }
}
