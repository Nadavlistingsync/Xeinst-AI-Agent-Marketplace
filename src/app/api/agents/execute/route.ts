import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { agentId, input, requestId } = await request.json();

    // Validate input
    if (!agentId || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, input' },
        { status: 400 }
      );
    }

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        creator: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent is active
    if (agent.status !== 'active') {
      return NextResponse.json(
        { error: 'Agent is not active' },
        { status: 400 }
      );
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.credits < agent.price) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Get user's connected accounts for this agent
    const connectedAccounts = await prisma.connectedAccount.findMany({
      where: {
        userId: session.user.id,
        agentId: agentId,
        status: 'connected'
      }
    });

    // Decrypt credentials
    const decryptedCredentials = connectedAccounts.map(account => ({
      ...account,
      credentials: JSON.parse(decrypt(account.credentials))
    }));

    // Create execution record
    const execution = await prisma.agentExecution.create({
      data: {
        agentId,
        userId: session.user.id,
        input: JSON.stringify(input),
        status: 'running',
        requestId: requestId || `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

    // Execute agent
    const startTime = Date.now();
    let output: any;
    let error: string | null = null;

    try {
      // Call the agent's webhook with user credentials
      const response = await fetch(agent.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agent.webhookSecret}`,
          'X-User-Id': session.user.id,
          'X-Execution-Id': execution.id
        },
        body: JSON.stringify({
          input,
          credentials: decryptedCredentials,
          executionId: execution.id,
          requestId: execution.requestId
        })
      });

      if (!response.ok) {
        throw new Error(`Agent execution failed: ${response.status} ${response.statusText}`);
      }

      output = await response.json();
      
    } catch (executionError) {
      error = executionError instanceof Error ? executionError.message : 'Unknown execution error';
      console.error('Agent execution error:', executionError);
    }

    const executionTime = Date.now() - startTime;

    // Update execution record
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        output: JSON.stringify(output),
        status: error ? 'failed' : 'completed',
        executionTime,
        error
      }
    });

    // Deduct credits if successful
    if (!error) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: agent.price
          }
        }
      });

      // Add credit transaction
      await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'spend',
          amount: -agent.price,
          agentId
        }
      });

      // Add earning for agent creator
      await prisma.creditTransaction.create({
        data: {
          userId: agent.createdBy,
          type: 'earn',
          amount: agent.price * 0.5, // 50% to creator, 50% to platform
          agentId
        }
      });
    }

    return NextResponse.json({
      executionId: execution.id,
      status: error ? 'failed' : 'completed',
      output: error ? null : output,
      error,
      executionTime,
      creditsUsed: error ? 0 : agent.price,
      remainingCredits: error ? user.credits : user.credits - agent.price
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const executions = await prisma.agentExecution.findMany({
      where: agentId ? { agentId, userId: session.user.id } : { userId: session.user.id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json({
      executions: executions.map(exec => ({
        id: exec.id,
        agentId: exec.agentId,
        agentName: exec.agent.name,
        status: exec.status,
        executionTime: exec.executionTime,
        createdAt: exec.createdAt,
        error: exec.error
      }))
    });

  } catch (error) {
    console.error('Get executions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
