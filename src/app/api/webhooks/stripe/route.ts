import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  const body = Buffer.from(buf);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { userId, credits, type } = session.metadata || {};
    if (type === 'credit_purchase' && userId && credits) {
      const creditAmount = parseInt(credits, 10);
      // Add credits to user
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: creditAmount } },
      });
      // Log transaction
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: 'purchase',
          amount: creditAmount,
        },
      });
      console.log(`Credited ${creditAmount} credits to user ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
} 