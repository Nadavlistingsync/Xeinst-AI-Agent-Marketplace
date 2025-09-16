import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const whereClause: any = {
      userId: session.user.id,
      status: 'connected'
    };

    if (agentId) {
      whereClause.agentId = agentId;
    }

    const accounts = await prisma.connectedAccount.findMany({
      where: whereClause,
      select: {
        id: true,
        platform: true,
        platformUserName: true,
        status: true,
        lastUsed: true,
        permissions: true,
        createdAt: true
      },
      orderBy: {
        lastUsed: 'desc'
      }
    });

    return NextResponse.json(accounts);

  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connected accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify the account belongs to the user
    const account = await prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        userId: session.user.id
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Delete the account
    await prisma.connectedAccount.delete({
      where: { id: accountId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
