

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/vehicles/[slug] - Get single vehicle by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const vehicle = await db.vehicle.findUnique({
      where: { slug },
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
        documents: {
          select: {
            id: true,
            type: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener vehículo' },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[slug] - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const existing = await db.vehicle.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    const vehicle = await db.vehicle.update({
      where: { slug },
      data: {
        ...body,
        updatedAt: new Date(),
        publishedAt: body.status === 'published' && existing.status !== 'published' 
          ? new Date() 
          : existing.publishedAt,
        soldAt: body.status === 'sold' && existing.status !== 'sold'
          ? new Date()
          : existing.soldAt,
      },
    });

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar vehículo' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[slug] - Delete vehicle (archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const existing = await db.vehicle.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Instead of deleting, archive the vehicle
    const vehicle = await db.vehicle.update({
      where: { slug },
      data: { status: 'archived', updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar vehículo' },
      { status: 500 }
    );
  }
}
