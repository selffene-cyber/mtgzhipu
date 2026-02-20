export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';


const paymentWebhookSchema = z.object({
  entity_type: z.enum(['reservation', 'auction_deposit']),
  entity_id: z.string(),
  amount: z.number().int().positive(),
  payment_id: z.string(),
  status: z.enum(['completed', 'failed']),
  idempotency_key: z.string(),
});

// POST /api/webhooks/payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = paymentWebhookSchema.parse(body);

    // Check idempotency
    const existingTx = await db.paymentTransaction.findUnique({
      where: { idempotencyKey: validated.idempotency_key },
    });

    if (existingTx) {
      // Already processed - return success (idempotent)
      return NextResponse.json({ success: true, idempotent: true });
    }

    // Create transaction record
    const transaction = await db.paymentTransaction.create({
      data: {
        id: crypto.randomUUID(),
        reservationId: validated.entity_type === 'reservation' ? validated.entity_id : null,
        auctionId: validated.entity_type === 'auction_deposit' ? validated.entity_id : null,
        provider: 'placeholder',
        providerTxId: validated.payment_id,
        amount: validated.amount,
        status: validated.status === 'completed' ? 'confirmed' : 'failed',
        idempotencyKey: validated.idempotency_key,
        webhookPayload: JSON.stringify(body),
        confirmedAt: validated.status === 'completed' ? new Date() : null,
      },
    });

    // Update related entity
    if (validated.status === 'completed') {
      if (validated.entity_type === 'reservation') {
        await db.reservation.update({
          where: { id: validated.entity_id },
          data: { status: 'paid', paymentId: validated.payment_id },
        });
      } else if (validated.entity_type === 'auction_deposit') {
        await db.auction.update({
          where: { id: validated.entity_id },
          data: { status: 'closed_won' },
        });
      }
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar webhook' }, { status: 500 });
  }
}
