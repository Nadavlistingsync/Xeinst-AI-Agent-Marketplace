import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../lib/auth";
import { stripe } from '../../../../lib/stripe';
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Connect account
    if (user.stripeConnectId) {
      return NextResponse.json({ 
        error: 'User already has a Stripe Connect account',
        connectId: user.stripeConnectId 
      }, { status: 400 });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You might want to make this configurable
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payouts?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payouts?success=true`,
      type: 'account_onboarding',
    });

    // Update user with Connect account ID
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        stripeConnectId: account.id,
        stripeConnectEnabled: false // Will be enabled after onboarding
      }
    });

    return NextResponse.json({ 
      url: accountLink.url,
      accountId: account.id 
    });

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json({ 
      error: 'Failed to create Stripe Connect account' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.stripeConnectId) {
      return NextResponse.json({ 
        hasConnectAccount: false 
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripeConnectId);
    
    // Check if account is fully onboarded
    const isEnabled = account.details_submitted && account.charges_enabled;

    // Update user's Connect status
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeConnectEnabled: isEnabled }
    });

    return NextResponse.json({
      hasConnectAccount: true,
      accountId: user.stripeConnectId,
      enabled: isEnabled,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements
    });

  } catch (error) {
    console.error('Error fetching Stripe Connect status:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Stripe Connect status' 
    }, { status: 500 });
  }
}
