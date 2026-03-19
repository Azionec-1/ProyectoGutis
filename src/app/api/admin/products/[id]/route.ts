import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  price: z.coerce.number().nonnegative('El precio no puede ser negativo'),
  stock: z.coerce.number().int('La cantidad debe ser un número entero').nonnegative('La cantidad no puede ser negativa'),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return NextResponse.json({ message: 'Error al obtener el producto' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = productSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, price, stock } = parsed.data;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        stock,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error('Error al actualizar el producto:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Error al actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado correctamente' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al eliminar el producto:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Error al eliminar el producto' }, { status: 500 });
  }
}
