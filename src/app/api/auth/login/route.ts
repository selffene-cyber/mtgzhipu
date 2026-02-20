

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';


const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error logging in:', error);
    return NextResponse.json(
      { success: false, error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
