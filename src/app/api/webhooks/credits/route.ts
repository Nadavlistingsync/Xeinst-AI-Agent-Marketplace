import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY ? new (require('stripe').default)(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
}) : null;

// Credit packages mapping
const CREDIT_PACKAGES = {
  small: { credits: 10, price: 9.99, name: 'Starter Pack' },
  medium: { credits: 50, price: 39.99, name: 'Power Pack' },
  large: { credits: 100, price: 69.99, name: 'Pro Pack' },
  enterprise: { credits: 500, price: 299.99, name: 'Enterprise Pack' }
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Payment system not configured',
        details: 'Stripe is not properly configured'
      }, { status: 503 });
    }

    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const { userId, creditPackage, credits } = paymentIntent.metadata;
      
      if (!userId || !creditPackage || !credits) {
        console.error('Missing metadata in payment intent:', paymentIntent.metadata);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Add credits to user account
      await prisma.$transaction(async (tx) => {
        // Add credits to user
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: { increment: parseInt(credits) }
          }
        });

        // Create credit transaction record
        await tx.creditTransaction.create({
          data: {
            userId,
            type: 'purchase',
            amount: parseInt(credits),
            stripePaymentIntentId: paymentIntent.id
          }
        });

        // Transaction record is already created above as CreditTransaction
      });

      console.log(`Successfully added ${credits} credits to user ${userId}`);
    }

    // Handle failed payment
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const { userId, creditPackage, credits } = paymentIntent.metadata;
      
      if (userId && creditPackage && credits) {
        // Create failed transaction record
        await prisma.creditTransaction.create({
          data: {
            userId: userId,
            type: 'purchase_failed',
            amount: parseInt(credits),
            stripePaymentIntentId: paymentIntent.id
          }
        });

        console.log(`Payment failed for user ${userId}: ${paymentIntent.last_payment_error?.message}`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
