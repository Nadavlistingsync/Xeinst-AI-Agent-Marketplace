import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { AuditLogger } from '@/lib/audit-logger';
import { WebhookSigning } from '@/lib/webhook-signing';
import { z } from 'zod';

const createVersionSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'),
  changelog: z.string().min(10).max(5000),
  webhookUrl: z.string().url().optional(),
  config: z.record(z.any()).optional(),
});

const updateVersionSchema = z.object({
  versionId: z.string(),
  isActive: z.boolean().optional(),
  changelog: z.string().min(10).max(5000).optional(),
  webhookUrl: z.string().url().optional(),
  config: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id;

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get all versions for the agent
    const versions = await prisma.agentVersion.findMany({
      where: { agentId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      agentId,
      versions: versions.map(version => ({
        id: version.id,
        version: version.version,
        changelog: version.changelog,
        webhookUrl: version.webhookUrl,
        config: version.config,
        isActive: version.isActive,
        createdAt: version.createdAt,
        creator: version.creator
      }))
    });

  } catch (error) {
    console.error('Error fetching agent versions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch agent versions' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await req.json();
    const { version, changelog, webhookUrl, config } = createVersionSchema.parse(body);

    // Check if agent exists and user owns it
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to create versions for this agent' }, { status: 403 });
    }

    // Check if version already exists
    const existingVersion = await prisma.agentVersion.findFirst({
      where: {
        agentId,
        version
      }
    });

    if (existingVersion) {
      return NextResponse.json({ 
        error: 'Version already exists for this agent' 
      }, { status: 400 });
    }

    // Generate webhook secret if webhook URL is provided
    let webhookSecret = null;
    if (webhookUrl) {
      webhookSecret = WebhookSigning.generateSecret();
    }

    // Create new version
    const newVersion = await prisma.agentVersion.create({
      data: {
        agentId,
        version,
        changelog,
        webhookUrl,
        webhookSecret,
        config,
        createdBy: session.user.id,
        isActive: false // New versions are inactive by default
      }
    });

    // Log version creation
    await AuditLogger.logAgent('version_created', agentId, session.user.id, {
      version,
      changelog: changelog.substring(0, 100),
      hasWebhook: !!webhookUrl
    });

    return NextResponse.json({
      success: true,
      version: {
        id: newVersion.id,
        version: newVersion.version,
        changelog: newVersion.changelog,
        webhookUrl: newVersion.webhookUrl,
        config: newVersion.config,
        isActive: newVersion.isActive,
        createdAt: newVersion.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating agent version:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create agent version' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await req.json();
    const { versionId, isActive, changelog, webhookUrl, config } = updateVersionSchema.parse(body);

    // Check if agent exists and user owns it
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update versions for this agent' }, { status: 403 });
    }

    // Check if version exists
    const version = await prisma.agentVersion.findFirst({
      where: {
        id: versionId,
        agentId
      }
    });

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // If activating this version, deactivate all other versions
    if (isActive === true) {
      await prisma.agentVersion.updateMany({
        where: {
          agentId,
          id: { not: versionId }
        },
        data: { isActive: false }
      });

      // Update the main agent with the active version's details
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          webhookUrl: webhookUrl || version.webhookUrl,
          webhookSecret: version.webhookSecret,
          config: config || version.config
        }
      });
    }

    // Update the version
    const updatedVersion = await prisma.agentVersion.update({
      where: { id: versionId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(changelog && { changelog }),
        ...(webhookUrl && { webhookUrl }),
        ...(config && { config })
      }
    });

    // Log version update
    await AuditLogger.logAgent('version_updated', agentId, session.user.id, {
      versionId,
      version: version.version,
      isActive,
      hasWebhook: !!webhookUrl
    });

    return NextResponse.json({
      success: true,
      version: {
        id: updatedVersion.id,
        version: updatedVersion.version,
        changelog: updatedVersion.changelog,
        webhookUrl: updatedVersion.webhookUrl,
        config: updatedVersion.config,
        isActive: updatedVersion.isActive,
        createdAt: updatedVersion.createdAt
      }
    });

  } catch (error) {
    console.error('Error updating agent version:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to update agent version' 
    }, { status: 500 });
  }
}