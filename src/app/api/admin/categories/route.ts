import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const newCategory = await prisma.menuCategory.create({
      data: { name },
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error('Error creating menu category:', error);

    return NextResponse.json(
      { message: 'Error creating menu category' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany();
    return NextResponse.json(categories);

  } catch (error) {
    console.error('Error fetching menu categories:', error);

    return NextResponse.json(
      { message: 'Error fetching menu categories' },
      { status: 500 }
    );
  }
}
