export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';


const createPaymentSchema = z.object({
  entityType: z.enum(['reservation', 'auction_deposit']),
  entityId: z.string(),
  amount: z.number().int().positive(),
  provider: z.enum(['mercadopago', 'webpay', 'transfer']),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

// POST /api/payments - Initialize payment (placeholder)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPaymentSchema.parse(body);

    // Create pending transaction
    const idempotencyKey = crypto.randomUUID();
    const transaction = await db.paymentTransaction.create({
      data: {
        id: crypto.randomUUID(),
        reservationId: validated.entityType === 'reservation' ? validated.entityId : null,
        auctionId: validated.entityType === 'auction_deposit' ? validated.entityId : null,
        provider: validated.provider,
        amount: validated.amount,
        status: 'pending',
        idempotencyKey,
      },
    });

    // Return placeholder payment URL
    // In production, this would redirect to the actual payment gateway
    const paymentUrl = `/pago?transactionId=${transaction.id}&provider=${validated.provider}&amount=${validated.amount}`;

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        paymentUrl,
        idempotencyKey,
        // Placeholder URLs for production
        productionUrls: {
          mercadopago: 'https://www.mercadopago.cl/checkout',
          webpay: 'https://webpay3g.transbank.cl',
          transfer: '/pago/transferencia',
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('Error creating payment:', error);
    return NextResponse.json({ success: false, error: 'Error al crear pago' }, { status: 500 });
  }
}
