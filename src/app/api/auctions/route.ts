

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/auctions - List auctions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [auctions, total] = await Promise.all([
      db.auction.findMany({
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
        skip,
        take: limit,
      }),
      db.auction.count({ where }),
    ]);

    // Get highest bid for each auction
    const auctionsWithHighest = auctions.map(auction => ({
      ...auction,
      highestBid: auction.bids[0]?.amount || auction.startingPrice,
      bidCount: auction.bids.length,
    }));

    return NextResponse.json({
      success: true,
      data: auctionsWithHighest,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener subastas' },
      { status: 500 }
    );
  }
}
