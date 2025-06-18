import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { credits } = await req.json();
    if (!credits || typeof credits !== 'number' || credits < 1) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
    }
    // 1 USD = 100 credits
    const amount = Math.ceil((credits / 100) * 100); // in cents
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits} Credits`,
              description: 'AI Agent Platform Credits',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_BASE_URL + '/dashboard?credits=success',
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + '/dashboard?credits=cancel',
      metadata: {
        userId: user.id,
        credits: credits.toString(),
        type: 'credit_purchase',
      },
    });
    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
} 