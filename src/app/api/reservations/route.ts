export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createReservationSchema = z.object({
  vehicleId: z.string().min(1, 'Vehículo es requerido'),
  customerName: z.string().min(2, 'Nombre es requerido'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  customerPhone: z.string().min(8, 'Teléfono inválido'),
  customerRut: z.string().optional(),
  amount: z.number().int().positive('Monto debe ser positivo'),
  notes: z.string().optional(),
});

// GET /api/reservations - List reservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [reservations, total] = await Promise.all([
      db.reservation.findMany({
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
      db.reservation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener reservas' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Create reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createReservationSchema.parse(body);

    // Check vehicle is available
    const vehicle = await db.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    if (vehicle.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Vehículo no disponible para reserva' },
        { status: 400 }
      );
    }

    // Check for existing active reservation
    const existingReservation = await db.reservation.findFirst({
      where: {
        vehicleId: validated.vehicleId,
        status: { in: ['pending_payment', 'paid', 'confirmed'] },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { success: false, error: 'Este vehículo ya tiene una reserva activa' },
        { status: 400 }
      );
    }

    // Create reservation with 48h expiration
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const reservation = await db.reservation.create({
      data: {
        vehicleId: validated.vehicleId,
        customerName: validated.customerName,
        customerEmail: validated.customerEmail || null,
        customerPhone: validated.customerPhone,
        customerRut: validated.customerRut,
        amount: validated.amount,
        notes: validated.notes,
        expiresAt,
        idempotencyKey,
        status: 'pending_payment',
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear reserva' },
      { status: 500 }
    );
  }
}
