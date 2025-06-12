import Stripe from 'stripe';
import { prisma } from './db';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true
});

interface CreateCheckoutSessionData {
  productId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreatePortalSessionData {
  userId: string;
  returnUrl: string;
}

export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<Stripe.Checkout.Session> {
  const product = await prisma.product.findUnique({
    where: { id: data.productId }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: data.userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            // images: product.images, // TODO: Add images field to Product model or handle differently
          },
          unit_amount: Math.round(Number(product.price) * 100)
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: {
      productId: product.id,
      userId: user.id
    }
  });
}

export async function createPortalSession(data: CreatePortalSessionData): Promise<Stripe.BillingPortal.Session> {
  const user = await prisma.user.findUnique({
    where: { id: data.userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // TODO: Add stripeCustomerId to User model or handle Stripe customer association differently
  // if (!user.stripeCustomerId) {
  //   throw new Error('User has no Stripe customer ID');
  // }

  // return stripe.billingPortal.sessions.create({
  //   customer: user.stripeCustomerId,
  //   return_url: data.returnUrl
  // });
  throw new Error('Stripe customer portal is not implemented: missing stripeCustomerId on User');
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { productId, userId } = session.metadata || {};

      if (!productId || !userId) {
        throw new Error('Missing metadata in checkout session');
      }

      await prisma.purchase.create({
        data: {
          productId,
          userId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          status: 'completed'
        }
      });
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findFirst({
        where: { id: customerId }
      });

      if (!user) {
        throw new Error('User not found for subscription');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          // subscriptionStatus: subscription.status, // TODO: Add subscriptionStatus to User model or handle differently
          // subscriptionId: subscription.id // TODO: Add subscriptionId to User model or handle differently
        }
      });
      break;
    }
  }
} 