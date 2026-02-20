

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createConsignmentSchema = z.object({
  ownerName: z.string().min(2, 'Nombre requerido'),
  ownerEmail: z.string().email().optional().or(z.literal('')),
  ownerPhone: z.string().min(8, 'Teléfono inválido'),
  ownerRut: z.string().optional(),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  km: z.number().int().nonnegative().optional(),
  expectedPrice: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

// GET /api/consignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const consignments = await db.consignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: consignments });
  } catch (error) {
    console.error('Error fetching consignments:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener consignaciones' }, { status: 500 });
  }
}

// POST /api/consignments - Public endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createConsignmentSchema.parse(body);

    const consignment = await db.consignment.create({
      data: {
        ownerName: validated.ownerName,
        ownerEmail: validated.ownerEmail || null,
        ownerPhone: validated.ownerPhone,
        ownerRut: validated.ownerRut,
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        km: validated.km,
        expectedPrice: validated.expectedPrice,
        notes: validated.notes,
        status: 'received',
      },
    });

    return NextResponse.json({ success: true, data: consignment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('Error creating consignment:', error);
    return NextResponse.json({ success: false, error: 'Error al crear consignación' }, { status: 500 });
  }
}
