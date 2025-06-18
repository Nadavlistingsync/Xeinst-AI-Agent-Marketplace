import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const agentId = params.id;
    const agent = await prisma.deployment.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    if (agent.createdBy === userId) {
      return NextResponse.json({ error: 'You cannot run your own agent for credits.' }, { status: 403 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const price = agent.pricePerRun || 1;
    if (user.credits < price) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }
    // Deduct credits from user
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: price } },
    });
    // Credit 80% to creator, 20% to platform (assume platform user id = 'platform')
    const creatorShare = Math.floor(price * 0.8);
    const platformShare = price - creatorShare;
    await prisma.user.update({
      where: { id: agent.createdBy },
      data: { credits: { increment: creatorShare } },
    });
    await prisma.user.update({
      where: { id: 'platform' },
      data: { credits: { increment: platformShare } },
    });
    // Log transactions
    await prisma.creditTransaction.createMany({
      data: [
        { userId, type: 'spend', amount: -price, agentId },
        { userId: agent.createdBy, type: 'earn', amount: creatorShare, agentId },
        { userId: 'platform', type: 'earn', amount: platformShare, agentId },
      ],
    });
    // TODO: Run the agent logic and return the result
    return NextResponse.json({ success: true, message: 'Agent run successful (placeholder output)' });
  } catch (error) {
    console.error('Error running agent:', error);
    return NextResponse.json({ error: 'Failed to run agent' }, { status: 500 });
  }
} 