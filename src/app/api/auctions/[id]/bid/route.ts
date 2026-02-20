import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const bidSchema = z.object({
  bidderName: z.string().min(2, 'Nombre requerido'),
  bidderPhone: z.string().min(8, 'Teléfono inválido'),
  bidderEmail: z.string().email().optional().or(z.literal('')),
  amount: z.number().int().positive('Monto debe ser positivo'),
  userId: z.string().optional(),
});

// Anti-sniping: extend auction if bid in last 5 minutes
async function applyAntiSniping(auctionId: string, endTime: Date): Promise<Date> {
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;
  const timeRemaining = endTime.getTime() - now.getTime();

  if (timeRemaining > 0 && timeRemaining < fiveMinutes) {
    const newEndTime = new Date(now.getTime() + fiveMinutes);
    await db.auction.update({
      where: { id: auctionId },
      data: { endTime: newEndTime },
    });
    return newEndTime;
  }
  return endTime;
}

// POST /api/auctions/[id]/bid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = bidSchema.parse(body);

    // Get auction
    const auction = await db.auction.findUnique({
      where: { id },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1 },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Subasta no encontrada' },
        { status: 404 }
      );
    }

    // Check auction is active
    if (auction.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'La subasta no está activa' },
        { status: 400 }
      );
    }

    // Check timing
    const now = new Date();
    if (now < auction.startTime) {
      return NextResponse.json(
        { success: false, error: 'La subasta aún no inicia' },
        { status: 400 }
      );
    }

    if (now > auction.endTime) {
      return NextResponse.json(
        { success: false, error: 'La subasta ya terminó' },
        { status: 400 }
      );
    }

    // Calculate minimum bid
    const currentHighest = auction.bids[0]?.amount || 0;
    const minBid = currentHighest > 0 
      ? currentHighest + auction.minIncrement 
      : auction.startingPrice;

    if (validated.amount < minBid) {
      return NextResponse.json(
        { success: false, error: `Monto mínimo: ${minBid.toLocaleString('es-CL')} CLP` },
        { status: 400 }
      );
    }

    // Create bid
    const bid = await db.bid.create({
      data: {
        auctionId: id,
        userId: validated.userId,
        amount: validated.amount,
      },
    });

    // Apply anti-sniping
    const newEndTime = await applyAntiSniping(id, auction.endTime);

    return NextResponse.json({
      success: true,
      data: {
        bid,
        newEndTime: newEndTime !== auction.endTime ? newEndTime : null,
        antiSnipingApplied: newEndTime !== auction.endTime,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating bid:', error);
    return NextResponse.json(
      { success: false, error: 'Error al realizar puja' },
      { status: 500 }
    );
  }
}
