import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const parseDate = (value?: unknown) => {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildPayload = (value: any) => ({
  name: typeof value?.name === 'string' ? value.name.trim() : '',
  startDate: parseDate(value?.startDate),
  endDate: parseDate(value?.endDate),
});

export async function GET() {
  const templates = await prisma.reportTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const payload = buildPayload(await req.json());
  if (!payload.name || !payload.startDate || !payload.endDate) {
    return NextResponse.json({ message: 'Nombre, fecha de inicio y fecha de fin son obligatorios.' }, { status: 400 });
  }

  const template = await prisma.reportTemplate.create({
    data: {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: 'Falta el identificador del reporte.' }, { status: 400 });
  }

  const payload = buildPayload(await req.json());
  if (!payload.name || !payload.startDate || !payload.endDate) {
    return NextResponse.json({ message: 'Nombre, fecha de inicio y fecha de fin son obligatorios.' }, { status: 400 });
  }

  const template = await prisma.reportTemplate.update({
    where: { id },
    data: {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  });

  return NextResponse.json(template);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: 'Falta el identificador del reporte.' }, { status: 400 });
  }

  await prisma.reportTemplate.delete({ where: { id } });
  return NextResponse.json({ message: 'Reporte eliminado.' });
}
