import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'Nombre requerido').max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password, name } = RegisterSchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null, role: 'USER' },
      select: { id: true, email: true, name: true, role: true },
    });

    await setSessionCookie(user.id);

    return NextResponse.json({ user });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors.map(e => e.message).join(', ') }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
