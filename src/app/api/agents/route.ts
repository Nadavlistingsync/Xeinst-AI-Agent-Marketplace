import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  apiUrl: z.string().url(),
  category: z.string().optional(),
  price: z.number().optional(),
  rating: z.number().optional(),
  download_count: z.number().optional(),
  review_count: z.number().optional(),
  model_type: z.string().optional(),
  framework: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.date().optional(),
  user_id: z.string().optional(),
  file_path: z.string().optional(),
  inputSchema: z.any(),
});

export type Agent = z.infer<typeof agentSchema>;

const uploadAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  documentation: z.string().optional(),
  webhookUrl: z.string().optional(),
  inputSchema: z.any().optional(),
  exampleInputs: z.any().optional(),
  version: z.string().default("1.0.0"),
  environment: z.string().default("production"),
  framework: z.string().default("custom"),
  modelType: z.string().default("custom"),
  config: z.any().optional(),
  model_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  file_path: z.string().optional(),
});

// Example agents for demonstration
const exampleAgents: Agent[] = [
  {
    id: '1',
    name: 'Text Summarizer',
    description: 'Summarizes a long text into a few key sentences.',
    apiUrl: 'https://api.example.com/summarize',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text to summarize.' },
        sentences: { type: 'number', description: 'Number of sentences in the summary.' },
      },
      required: ['text', 'sentences'],
    },
  },
  {
    id: '2',
    name: 'Image Classifier',
    description: 'Classifies the content of an image from a URL.',
    apiUrl: 'https://api.example.com/classify',
    inputSchema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', description: 'URL of the image to classify.' },
      },
      required: ['imageUrl'],
    },
  },
  {
    id: '3',
    name: 'Sentiment Analysis',
    description: 'Analyzes the sentiment of a piece of text (positive, negative, or neutral).',
    apiUrl: 'https://api.example.com/sentiment',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text to analyze.' },
      },
      required: ['text'],
    },
  },
];

export async function GET() {
  return withEnhancedErrorHandling(async () => {
    console.log('GET /api/agents: Starting to fetch agents...');
    
    // First try to get agents from the database
    console.log('GET /api/agents: Attempting database query...');
    const dbAgents = await prisma.agent.findMany({
      where: { isPublic: true },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`GET /api/agents: Found ${dbAgents.length} agents in database`);

    // Transform to marketplace format
    const marketplaceAgents: Agent[] = dbAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      apiUrl: agent.fileUrl, // Use fileUrl as apiUrl
      category: agent.category,
      price: agent.price,
      rating: 0, // Default rating
      download_count: agent.downloadCount || 0,
      review_count: 0, // Default review count
      model_type: agent.modelType,
      framework: agent.framework,
      version: agent.version,
      status: 'active', // Default status
      tags: [], // Default empty tags
      created_at: agent.createdAt,
      user_id: agent.createdBy,
      file_path: agent.fileUrl || '',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'Input for the agent.' },
        },
        required: ['input'],
      },
    }));

    // Combine with example agents
    const allAgents = [...exampleAgents, ...marketplaceAgents];

    console.log(`GET /api/agents: Returning ${allAgents.length} total agents`);

    return NextResponse.json({
      success: true,
      agents: allAgents,
      total: allAgents.length,
      timestamp: new Date().toISOString()
    });
  }, { endpoint: '/api/agents', method: 'GET' });
}

export async function POST(request: NextRequest) {
  return withEnhancedErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new EnhancedAppError(
        'Authentication required',
        401,
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM,
        'AUTH_REQUIRED',
        null,
        false,
        undefined,
        'Please sign in to upload an agent',
        ['Sign in to your account', 'Check your credentials', 'Reset your password if needed']
      );
    }

    const body = await request.json();
    const validatedData = uploadAgentSchema.parse(body);

    // Map fields from test format to database format
    const modelType = validatedData.modelType || validatedData.model_type || 'custom';
    const webhookUrl = validatedData.webhookUrl || validatedData.file_path || '';

    // Create the agent in the database
    const agent = await prisma.agent.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        documentation: validatedData.documentation,
        fileUrl: webhookUrl, // Store webhook URL in fileUrl field
        version: validatedData.version,
        environment: validatedData.environment,
        framework: validatedData.framework,
        modelType: modelType,
        isPublic: true,
        createdBy: session.user.id,
        config: validatedData.config,
      },
    });

    // Also create a deployment for the agent
    await prisma.deployment.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        createdBy: session.user.id,
        deployedBy: session.user.id,
        isPublic: true,
        version: validatedData.version,
        environment: validatedData.environment,
        framework: validatedData.framework,
        modelType: modelType,
        status: 'active',
        accessLevel: 'public',
        licenseType: 'free',
        startDate: new Date(),
        rating: 0,
        totalRatings: 0,
        downloadCount: 0,
        health: {},
        source: webhookUrl, // Store webhook URL in source field
        pricePerRun: Math.round(validatedData.price * 100), // Convert to cents
        price: Math.round(validatedData.price * 100), // Convert to cents
      },
    });

    // Return the created agent in the marketplace format
    const marketplaceAgent: Agent = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      apiUrl: webhookUrl, // Use webhook URL as apiUrl
      category: agent.category,
      price: agent.price,
      rating: 0, // Default rating since Agent model doesn't have rating field
      download_count: agent.downloadCount || 0,
      review_count: 0, // Default review count since Agent model doesn't have totalRatings field
      model_type: agent.modelType,
      framework: agent.framework,
      version: agent.version,
      status: 'active', // Default status since Agent model doesn't have status field
      tags: [], // Default empty tags since Agent model doesn't have tags field
      created_at: agent.createdAt,
      user_id: agent.createdBy || 'test-user-id', // Ensure user_id is always present
      file_path: agent.fileUrl || '',
      inputSchema: validatedData.inputSchema || {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'Input for the agent.' },
        },
        required: ['input'],
      },
    };

    return NextResponse.json({
      success: true,
      agent: marketplaceAgent
    });
  }, { endpoint: '/api/agents', method: 'POST' });
} 