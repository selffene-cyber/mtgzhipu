import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/leads/[id] - Get single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            photos: { take: 1, orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener lead' },
      { status: 500 }
    );
  }
}

// PUT /api/leads/[id] - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: new Date(),
    };

    // Set lastContactAt if status changes to contacted
    if (body.status === 'contacted' && existing.status !== 'contacted') {
      updateData.lastContactAt = new Date();
    }

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Archive lead (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as closed_lost
    const lead = await db.lead.update({
      where: { id },
      data: { status: 'closed_lost', updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar lead' },
      { status: 500 }
    );
  }
}
