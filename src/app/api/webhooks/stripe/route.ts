import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { productId, userId } = session.metadata || {};

      if (!productId || !userId) {
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      // Check if purchase already exists
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      if (existingPurchase) {
        return NextResponse.json(
          { error: 'Purchase already exists' },
          { status: 400 }
        );
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            product_id: productId,
            user_id: userId,
            status: 'completed',
            transaction_id: session.payment_intent,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
          },
        ]);

      if (purchaseError) {
        console.error('Failed to create purchase:', purchaseError);
        return NextResponse.json(
          { error: 'Failed to create purchase' },
          { status: 500 }
        );
      }

      // Increment download counter
      const { error: counterError } = await supabase.rpc('increment_download_count', {
        product_id: productId,
      });

      if (counterError) {
        console.error('Failed to increment download counter:', counterError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 