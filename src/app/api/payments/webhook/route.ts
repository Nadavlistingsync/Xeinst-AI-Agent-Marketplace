import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert from cents
    const creditsToAdd = Math.floor(amount * 10); // 1 USD = 10 credits

    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: creditsToAdd
        }
      }
    });

    // Create credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: 'purchase',
        amount: creditsToAdd,
        stripePaymentIntentId: paymentIntent.id
      }
    });

    console.log(`Added ${creditsToAdd} credits to user ${userId}`);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    
    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Log failed payment
    console.log(`Payment failed for user ${userId}: ${paymentIntent.last_payment_error?.message}`);

    // You could send a notification to the user here
    // or update a failed payment record

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}
