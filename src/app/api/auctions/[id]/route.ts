

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/auctions/[id] - Get single auction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auction = await db.auction.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            photos: { orderBy: { orderIndex: 'asc' } },
          },
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Subasta no encontrada' },
        { status: 404 }
      );
    }

    // Get counts and highest bid
    const bidCount = await db.bid.count({ where: { auctionId: id } });
    const highestBid = await db.bid.findFirst({
      where: { auctionId: id },
      orderBy: { amount: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...auction,
        bidCount,
        highestBid: highestBid?.amount || auction.startingPrice,
      },
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener subasta' },
      { status: 500 }
    );
  }
}
