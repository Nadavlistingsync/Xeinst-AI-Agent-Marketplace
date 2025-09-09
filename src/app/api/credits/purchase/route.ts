import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Initialize Stripe only if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY ? new (require('stripe').default)(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
}) : null;

const purchaseCreditsSchema = z.object({
  creditPackage: z.enum(['small', 'medium', 'large', 'enterprise']),
  paymentMethodId: z.string().optional(), // For Stripe
  agentId: z.string().optional(), // For direct agent purchase
  quantity: z.number().min(1).max(100).optional() // For direct agent purchase
});

// Credit packages
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

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = purchaseCreditsSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true, 
        credits: true,
        stripeCustomerId: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle direct agent purchase
    if (validatedData.agentId && validatedData.quantity) {
      return await handleDirectAgentPurchase(user, validatedData.agentId, validatedData.quantity);
    }

    // Handle credit package purchase
    const packageInfo = CREDIT_PACKAGES[validatedData.creditPackage];
    
    // Create Stripe payment intent
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(packageInfo.price * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId: user.id,
        creditPackage: validatedData.creditPackage,
        credits: packageInfo.credits.toString()
      },
      description: `Purchase ${packageInfo.credits} credits - ${packageInfo.name}`
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: packageInfo.price,
        credits: packageInfo.credits,
        packageName: packageInfo.name
      }
    });

  } catch (error) {
    console.error('Credit purchase error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle direct agent purchase (buy credits to use a specific agent)
async function handleDirectAgentPurchase(
  user: any, 
  agentId: string, 
  quantity: number
): Promise<NextResponse> {
  try {
    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { creator: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.status !== 'active') {
      return NextResponse.json({ error: 'Agent is not available' }, { status: 400 });
    }

    const totalCost = agent.price * quantity;
    const requiredCredits = totalCost;

    // Check if user has enough credits
    if (user.credits < requiredCredits) {
      const shortfall = requiredCredits - user.credits;
      return NextResponse.json({
        error: 'Insufficient credits',
        details: `You need ${shortfall} more credits to purchase ${quantity} uses of this agent`,
        requiredCredits: requiredCredits,
        currentCredits: user.credits,
        shortfall: shortfall
      }, { status: 400 });
    }

    // Deduct credits and create purchase record
    await prisma.$transaction(async (tx) => {
      // Deduct credits from user
      await tx.user.update({
        where: { id: user.id },
        data: { 
          credits: { decrement: requiredCredits }
        }
      });

      // Create purchase record
      await tx.purchase.create({
        data: {
          productId: agent.id,
          userId: user.id,
          amount: totalCost,
          status: 'completed',
          paidAt: new Date()
        }
      });

      // Note: Agent earnings would be implemented based on the agent model

      // Note: Earnings records would be implemented based on the earnings model
    });

    return NextResponse.json({
      success: true,
      purchase: {
        agentId: agent.id,
        agentName: agent.name,
        quantity: quantity,
        totalCost: totalCost,
        creditsUsed: requiredCredits,
        remainingCredits: user.credits - requiredCredits
      }
    });

  } catch (error) {
    console.error('Direct agent purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to process agent purchase' },
      { status: 500 }
    );
  }
}

// Get available credit packages
export async function GET(): Promise<NextResponse> {
  try {
    const packages = Object.entries(CREDIT_PACKAGES).map(([key, value]) => ({
      id: key,
      name: value.name,
      credits: value.credits,
      price: value.price,
      pricePerCredit: (value.price / value.credits).toFixed(2)
    }));

    return NextResponse.json({
      success: true,
      packages
    });

  } catch (error) {
    console.error('Get credit packages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
