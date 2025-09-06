import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const payoutRequestSchema = z.object({
  amountCredits: z.number().min(100).max(10000), // Minimum 100 credits, maximum 10,000
});

// Credit to USD conversion rate (configurable)
const CREDIT_TO_USD_RATE = 0.01; // 1 credit = $0.01

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const body = await req.json();
    const { amountCredits } = payoutRequestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has Stripe Connect account
    if (!user.stripeConnectId || !user.stripeConnectEnabled) {
      return NextResponse.json({ 
        error: 'Stripe Connect account required. Please complete onboarding first.' 
      }, { status: 400 });
    }

    // Check if user has enough credits
    if (user.credits < amountCredits) {
      return NextResponse.json({ 
        error: `Insufficient credits. You have ${user.credits} credits, but requested ${amountCredits}.` 
      }, { status: 400 });
    }

    // Calculate USD amount
    const amountUsd = amountCredits * CREDIT_TO_USD_RATE;

    // Check minimum payout amount ($5)
    if (amountUsd < 5) {
      return NextResponse.json({ 
        error: 'Minimum payout amount is $5 (500 credits)' 
      }, { status: 400 });
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        userId: user.id,
        amountCredits: amountCredits,
        amountUsd: amountUsd,
        status: 'requested'
      }
    });

    // Deduct credits from user
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: amountCredits } }
    });

    // Log credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'redeem',
        amount: -amountCredits, // Negative amount for redemption
      }
    });

    // Process payout with Stripe
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amountUsd * 100), // Convert to cents
        currency: 'usd',
        destination: user.stripeConnectId,
        metadata: {
          payoutId: payout.id,
          userId: user.id,
          credits: amountCredits.toString()
        }
      });

      // Update payout with Stripe transfer ID
      await prisma.payout.update({
        where: { id: payout.id },
        data: { 
          stripeTransferId: transfer.id,
          status: 'processing'
        }
      });

      return NextResponse.json({
        success: true,
        payout: {
          id: payout.id,
          amountCredits,
          amountUsd,
          status: 'processing',
          transferId: transfer.id
        }
      });

    } catch (stripeError) {
      // If Stripe transfer fails, rollback the credit deduction
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { increment: amountCredits } }
      });

      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          type: 'adjust',
          amount: amountCredits, // Positive amount for adjustment
        }
      });

      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'failed' }
      });

      console.error('Stripe transfer failed:', stripeError);
      return NextResponse.json({ 
        error: 'Payout processing failed. Credits have been restored.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing payout request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to process payout request' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's payout history
    const payouts = await prisma.payout.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 payouts
    });

    return NextResponse.json({
      payouts: payouts.map(payout => ({
        id: payout.id,
        amountCredits: payout.amountCredits,
        amountUsd: payout.amountUsd,
        status: payout.status,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payouts' 
    }, { status: 500 });
  }
}
