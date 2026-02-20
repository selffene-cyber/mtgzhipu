export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createLeadSchema = z.object({
  vehicleId: z.string().optional(),
  customerName: z.string().min(2, 'Nombre es requerido'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  customerPhone: z.string().min(8, 'Teléfono inválido'),
  source: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/leads - List leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          vehicle: {
            include: {
              photos: { take: 1, orderBy: { orderIndex: 'asc' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createLeadSchema.parse(body);

    const lead = await db.lead.create({
      data: {
        vehicleId: validated.vehicleId,
        customerName: validated.customerName,
        customerEmail: validated.customerEmail || null,
        customerPhone: validated.customerPhone,
        source: validated.source || 'web',
        notes: validated.notes,
        status: 'new',
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear lead' },
      { status: 500 }
    );
  }
}
