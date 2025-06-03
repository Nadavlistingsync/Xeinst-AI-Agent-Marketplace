import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { agentValidationSchema, validateAgentCode, deployAgent } from '@/lib/agent-deployment';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = agentValidationSchema.parse(body);

    // Validate the agent code
    const isValidCode = await validateAgentCode(validatedData.file_url);
    if (!isValidCode) {
      return NextResponse.json(
        { error: 'Invalid agent code structure' },
        { status: 400 }
      );
    }

    // Create the deployment record
    const deployment = await prisma.deployment.create({
      data: {
        name: body.name,
        description: body.description,
        environment: body.environment || 'production',
        source: body.source,
        status: 'pending',
        accessLevel: body.accessLevel || 'public',
        licenseType: body.licenseType || 'free',
        framework: body.framework,
        version: body.version || '1.0.0',
        modelType: body.modelType || 'standard',
        deployedBy: session.user.id,
        createdBy: session.user.id
      }
    });

    // Start the deployment process
    const { success, error } = await deployAgent({
      name: deployment.name,
      description: deployment.description,
      userId: session.user.id,
      version: deployment.version
    });
    if (!success) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Deployment error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 