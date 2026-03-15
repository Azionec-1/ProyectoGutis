
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const category = await prisma.menuCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching menu category:', error);
    return NextResponse.json({ message: 'Error fetching menu category' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Missing required field: name' }, { status: 400 });
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Error updating menu category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating menu category' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id:string } }) {
  try {
    const { id } = params;

    await prisma.menuCategory.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting menu category:', error);
    // Check if the error is due to a record not found
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting menu category' }, { status: 500 });
  }
}
