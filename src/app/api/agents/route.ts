import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  apiUrl: z.string().url(),
  inputSchema: z.any(),
});

export type Agent = z.infer<typeof agentSchema>;

const uploadAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  documentation: z.string().optional(),
  apiUrl: z.string().url("Must be a valid URL"),
  inputSchema: z.any(),
  version: z.string().default("1.0.0"),
  environment: z.string().default("production"),
  framework: z.string().default("custom"),
  modelType: z.string().default("custom"),
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
  try {
    console.log('GET /api/agents: Starting to fetch agents...');
    
    // First try to get agents from the database
    console.log('GET /api/agents: Attempting database query...');
    const dbAgents = await prisma.agent.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to prevent performance issues
    });
    
    console.log(`GET /api/agents: Found ${dbAgents.length} agents in database`);

    // Convert database agents to the expected format
    const marketplaceAgents: Agent[] = dbAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      apiUrl: agent.fileUrl, // Using fileUrl as apiUrl for now
      inputSchema: {
        type: 'object',
        properties: {
          // Default schema - in a real app, this would be stored in the database
          input: { type: 'string', description: 'Input for the agent.' },
        },
        required: ['input'],
      },
    }));

    // Combine database agents with example agents
    const allAgents = [...marketplaceAgents, ...exampleAgents];
    
    console.log(`GET /api/agents: Returning ${allAgents.length} total agents`);

    // Add a short delay to simulate a network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(allAgents);
  } catch (error) {
    console.error('GET /api/agents: Error fetching agents:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Fallback to example agents if database fails
    console.log('GET /api/agents: Falling back to example agents');
    return NextResponse.json(exampleAgents);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = uploadAgentSchema.parse(body);

    // Create the agent in the database
    const agent = await prisma.agent.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        documentation: validatedData.documentation,
        fileUrl: validatedData.apiUrl,
        version: validatedData.version,
        environment: validatedData.environment,
        framework: validatedData.framework,
        modelType: validatedData.modelType,
        isPublic: true,
        createdBy: session.user.id,
      },
    });

    // Return the created agent in the marketplace format
    const marketplaceAgent: Agent = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      apiUrl: agent.fileUrl,
      inputSchema: validatedData.inputSchema || {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'Input for the agent.' },
        },
        required: ['input'],
      },
    };

    return NextResponse.json(marketplaceAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 