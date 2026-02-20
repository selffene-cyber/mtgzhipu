export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reservations/[id] - Get single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            photos: { take: 1, orderBy: { orderIndex: 'asc' } },
          },
        },
        transactions: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener reserva' },
      { status: 500 }
    );
  }
}

// PUT /api/reservations/[id] - Update reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.reservation.findUnique({ 
      where: { id },
      include: { vehicle: true }
    });
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: new Date(),
    };

    // Set confirmedAt if status changes to confirmed
    if (body.status === 'confirmed' && existing.status !== 'confirmed') {
      updateData.confirmedAt = new Date();
    }

    // Set cancelledAt if status changes to cancelled
    if (body.status === 'cancelled' && existing.status !== 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const reservation = await db.reservation.update({
      where: { id },
      data: updateData,
    });

    // If reservation is confirmed, update vehicle status
    if (body.status === 'confirmed' && existing.vehicle) {
      await db.vehicle.update({
        where: { id: existing.vehicle.id },
        data: { status: 'reserved' },
      });
    }

    // If reservation is cancelled or expired, release vehicle
    if ((body.status === 'cancelled' || body.status === 'expired') && existing.vehicle) {
      await db.vehicle.update({
        where: { id: existing.vehicle.id },
        data: { status: 'published' },
      });
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar reserva' },
      { status: 500 }
    );
  }
}
