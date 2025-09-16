import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !['free', 'basic', 'premium'].includes(plan)) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    // Here you would typically integrate with a payment processor
    // For now, we'll just update the subscription tier directly

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        subscriptionTier: plan,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[SUBSCRIPTION_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        subscriptionTier: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[SUBSCRIPTION_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 