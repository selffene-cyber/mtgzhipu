export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createAuctionSchema = z.object({
  vehicleId: z.string().min(1),
  startingPrice: z.number().int().positive(),
  minIncrement: z.number().int().positive().default(100000),
  depositAmount: z.number().int().positive().default(50000),
  startTime: z.string(),
  endTime: z.string(),
});

// GET /api/admin/auctions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const auctions = await db.auction.findMany({
      where,
      include: {
        vehicle: {
          include: {
            photos: { take: 1, orderBy: { orderIndex: 'asc' } },
          },
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: auctions });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener subastas' },
      { status: 500 }
    );
  }
}

// POST /api/admin/auctions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAuctionSchema.parse(body);

    const vehicle = await db.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle || vehicle.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Vehículo no disponible para subasta' },
        { status: 400 }
      );
    }

    const auction = await db.auction.create({
      data: {
        vehicleId: validated.vehicleId,
        startingPrice: validated.startingPrice,
        minIncrement: validated.minIncrement,
        depositAmount: validated.depositAmount,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
        status: 'scheduled',
      },
    });

    return NextResponse.json({ success: true, data: auction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('Error creating auction:', error);
    return NextResponse.json({ success: false, error: 'Error al crear subasta' }, { status: 500 });
  }
}
