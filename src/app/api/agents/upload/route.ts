import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { webhookConfig, isWebhookSystemReady } from '../../../../lib/webhook-config';
import { isDatabaseAvailable, createDatabaseErrorResponse } from "@/lib/db-check";

// Schema for agent upload
const agentUploadSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(1, "Price must be at least 1 credit").max(1000, "Price cannot exceed 1000 credits"),
  webhookUrl: z.string().url("Valid webhook URL is required"),
  webhookSecret: z.string().optional(),
  inputSchema: z.object({
    type: z.string(),
    properties: z.record(z.any()),
    required: z.array(z.string()).optional()
  }),
  exampleInputs: z.array(z.any()).optional(),
  documentation: z.string().optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  version: z.string().default("1.0.0"),
  environment: z.string().default("production"),
  framework: z.string().default("webhook"),
  modelType: z.string().default("custom"),
  config: z.any().optional(),
  // Agent creator settings
  earningsSplit: z.number().min(0.5).max(0.95).default(0.5), // Creator gets 50%, platform gets 50%
  isPublic: z.boolean().default(true),
  requiresApproval: z.boolean().default(false)
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }

  try {
    // Check if webhook system is ready
    if (!isWebhookSystemReady()) {
      return NextResponse.json({ 
        error: 'Webhook system is not properly configured',
        details: 'Please check your environment variables'
      }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = agentUploadSchema.parse(body);

    // Check if user has sufficient permissions to upload agents
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true, 
        credits: true,
        subscriptionTier: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can upload agents (premium feature or admin)
    if (user.subscriptionTier !== 'premium') {
      return NextResponse.json({ 
        error: 'Agent upload requires premium subscription',
        details: 'Upgrade to premium to upload and sell agents'
      }, { status: 403 });
    }

    // Test webhook URL before saving
    try {
      const testResponse = await fetch(validatedData.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': webhookConfig.production.userAgent,
          'X-Webhook-Event': 'test',
          'X-Test': 'true',
          ...(validatedData.webhookSecret && {
            'Authorization': `Bearer ${validatedData.webhookSecret}`
          })
        },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          message: 'This is a test webhook from AI Agent Marketplace'
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout for test
      });

      if (!testResponse.ok) {
        return NextResponse.json({ 
          error: 'Webhook URL test failed',
          details: `HTTP ${testResponse.status}: ${testResponse.statusText}`
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ 
        error: 'Webhook URL test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Create agent record
    const agent = await prisma.agent.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        webhookUrl: validatedData.webhookUrl,
        webhookSecret: validatedData.webhookSecret,
        documentation: validatedData.documentation,
        fileUrl: '',
        version: validatedData.version,
        environment: validatedData.environment,
        framework: validatedData.framework,
        modelType: validatedData.modelType,
        config: {
          inputSchema: validatedData.inputSchema,
          exampleInputs: validatedData.exampleInputs || [],
          tags: validatedData.tags || [],
          ...validatedData.config
        },
        createdBy: session.user.id,
        isPublic: validatedData.isPublic,
        status: 'draft',
      }
    });

    // Create deployment record for tracking
    await prisma.deployment.create({
      data: {
        name: agent.name,
        description: agent.description,
        status: 'active',
        accessLevel: 'public',
        licenseType: 'commercial',
        environment: validatedData.environment,
        framework: validatedData.framework,
        modelType: validatedData.modelType,
        source: 'agent_upload',
        deployedBy: session.user.id,
        createdBy: session.user.id,
        isPublic: validatedData.isPublic,
        version: validatedData.version
      }
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        price: agent.price,
        status: agent.status,
        webhookUrl: agent.webhookUrl,
        createdAt: agent.createdAt,
        message: 'Agent uploaded successfully and is now live'
      }
    });

  } catch (error) {
    console.error('Agent upload error:', error);
    
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

// Get user's uploaded agents
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {
      createdBy: session.user.id
    };

    if (status) {
      whereClause.status = status;
    }

    const agents = await prisma.agent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        status: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            webhookLogs: true,
            reviews: true
          }
        }
      }
    });

    const totalCount = await prisma.agent.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      agents,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get user agents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
