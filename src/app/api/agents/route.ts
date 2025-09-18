import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
// import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from "@/lib/enhanced-error-handling";

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

const exampleAgents: Agent[] = [
  {
    id: 'example-text-summarizer',
    name: 'Text Summarizer',
    description: 'AI agent that summarizes long texts into concise insights.',
    apiUrl: 'https://example.com/api/text-summarizer',
    category: 'productivity',
    price: 0,
    rating: 4.8,
    download_count: 2400,
    review_count: 128,
    model_type: 'gpt-4',
    framework: 'langchain',
    version: '1.0.0',
    status: 'active',
    tags: ['summarization', 'text'],
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    user_id: 'example-user',
    file_path: '/agents/text-summarizer',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text that should be summarised.'
        },
        maxLength: {
          type: 'number',
          description: 'Maximum length of the summary.',
          minimum: 50,
          maximum: 500
        }
      },
      required: ['text']
    }
  },
  {
    id: 'example-image-classifier',
    name: 'Image Classifier',
    description: 'Classifies and categorises product imagery using vision models.',
    apiUrl: 'https://example.com/api/image-classifier',
    category: 'analytics',
    price: 12,
    rating: 4.6,
    download_count: 1850,
    review_count: 92,
    model_type: 'vision-transformer',
    framework: 'pytorch',
    version: '2.1.0',
    status: 'active',
    tags: ['computer vision', 'classification'],
    created_at: new Date('2024-02-10T00:00:00.000Z'),
    user_id: 'example-user',
    file_path: '/agents/image-classifier',
    inputSchema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          format: 'uri',
          description: 'URL of the image to analyse.'
        },
        returnTopK: {
          type: 'number',
          description: 'Number of categories to return.',
          minimum: 1,
          maximum: 5
        }
      },
      required: ['imageUrl']
    }
  },
  {
    id: 'example-sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Detects sentiment and emotion from customer feedback.',
    apiUrl: 'https://example.com/api/sentiment-analysis',
    category: 'communication',
    price: 5,
    rating: 4.7,
    download_count: 3200,
    review_count: 210,
    model_type: 'gpt-3.5',
    framework: 'transformers',
    version: '1.5.2',
    status: 'active',
    tags: ['sentiment', 'nlp'],
    created_at: new Date('2024-03-15T00:00:00.000Z'),
    user_id: 'example-user',
    file_path: '/agents/sentiment-analysis',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Feedback or review that should be analysed.'
        },
        language: {
          type: 'string',
          description: 'Language code for the provided text.',
          default: 'en'
        }
      },
      required: ['text']
    }
  }
];

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

// Agents are now loaded from Supabase database

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/agents: Starting to fetch agents...');

    const url = request?.url ? new URL(request.url) : null;
    const categoryFilter = url?.searchParams.get('category');
    const minPriceFilter = url?.searchParams.get('minPrice');
    const maxPriceFilter = url?.searchParams.get('maxPrice');

    let marketplaceAgents: Agent[] = [];

    try {
      console.log('GET /api/agents: Attempting database query...');
      const dbAgents = await prisma.agent.findMany({
        where: {
          status: 'active',
          isPublic: true
        },
        orderBy: { createdAt: 'desc' }
      });

      marketplaceAgents = dbAgents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        apiUrl: agent.fileUrl || agent.webhookUrl || '',
        category: agent.category,
        price: typeof agent.price === 'number' ? agent.price : Number(agent.price ?? 0),
        rating: agent.rating ?? 0,
        download_count: agent.downloadCount ?? agent.download_count ?? 0,
        review_count: agent.reviewCount ?? agent.review_count ?? 0,
        model_type: agent.modelType || agent.model_type || 'custom',
        framework: agent.framework || 'custom',
        version: agent.version || '1.0.0',
        status: agent.status,
        tags: agent.tags ?? [],
        created_at: agent.createdAt ?? agent.created_at ?? new Date(),
        user_id: agent.createdBy || agent.user_id || '',
        file_path: agent.fileUrl || agent.file_path || '',
        inputSchema: agent.inputSchema ?? {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Input for the agent.' },
          },
          required: ['input'],
        },
      }));

      console.log(`GET /api/agents: Returning ${marketplaceAgents.length} agents from database`);
    } catch (databaseError) {
      console.warn('GET /api/agents: Database query failed, returning example agents with error.', databaseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch agents',
          agents: exampleAgents,
          total: exampleAgents.length,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    let filteredDbAgents = [...marketplaceAgents];

    if (categoryFilter) {
      filteredDbAgents = filteredDbAgents.filter((agent) =>
        agent.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (minPriceFilter) {
      const minPrice = Number.parseFloat(minPriceFilter);
      if (!Number.isNaN(minPrice)) {
        filteredDbAgents = filteredDbAgents.filter((agent) => (agent.price ?? 0) >= minPrice);
      }
    }

    if (maxPriceFilter) {
      const maxPrice = Number.parseFloat(maxPriceFilter);
      if (!Number.isNaN(maxPrice)) {
        filteredDbAgents = filteredDbAgents.filter((agent) => (agent.price ?? 0) <= maxPrice);
      }
    }

    const allAgents: Agent[] = [...exampleAgents, ...filteredDbAgents];

    return NextResponse.json({
      success: true,
      agents: allAgents,
      total: allAgents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GET /api/agents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request data
    let validatedData;
    try {
      validatedData = uploadAgentSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

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
  } catch (error) {
    console.error('POST /api/agents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 