import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/consignments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const consignment = await db.consignment.findUnique({ where: { id } });

    if (!consignment) {
      return NextResponse.json({ success: false, error: 'Consignación no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: consignment });
  } catch (error) {
    console.error('Error fetching consignment:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener consignación' }, { status: 500 });
  }
}

// PUT /api/consignments/[id] - Update (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const consignment = await db.consignment.findUnique({ where: { id } });
    if (!consignment) {
      return NextResponse.json({ success: false, error: 'Consignación no encontrada' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };

    // If approving, create vehicle
    if (body.status === 'approved' && consignment.status !== 'approved') {
      const slug = `${consignment.brand}-${consignment.model}-${consignment.year}-${Date.now().toString(36)}`.toLowerCase();
      
      const vehicle = await db.vehicle.create({
        data: {
          slug,
          brand: consignment.brand,
          model: consignment.model,
          year: consignment.year,
          km: consignment.km,
          price: consignment.expectedPrice || 0,
          status: 'draft',
          isConsignment: true,
          consignorName: consignment.ownerName,
          consignorPhone: consignment.ownerPhone,
        },
      });

      updateData.vehicleId = vehicle.id;
    }

    const updated = await db.consignment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating consignment:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar consignación' }, { status: 500 });
  }
}
