import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, verifyPassword } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Contraseña requerida'),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = LoginSchema.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    console.error(error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
