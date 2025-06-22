import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse } from '@/lib/error-handling';
import { z } from 'zod';

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  apiUrl: z.string().url(),
  inputSchema: z.any(), // In a real app, you'd want a more specific schema for the JSON schema itself
});

export type Agent = z.infer<typeof agentSchema>;

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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const creator = url.searchParams.get('creator');

    let where: any = {};
    // Only filter by creator if explicitly requested
    if (creator === 'true') {
      // Optionally, you could require auth for this branch only
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      where = { createdBy: session.user.id };
    }

    const agents = await prisma.deployment.findMany({ where });

    // Map to the structure expected by the dashboard
    return NextResponse.json({
      agents: agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        downloads: agent.downloadCount ?? 0,
        revenue: 0, // Replace with actual revenue if available
        status: agent.status,
      }))
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = agentSchema.parse(body);

    const agent = await (prisma as any).agent.create({
      data: {
        ...validatedData,
        modelType: body.modelType || 'standard',
        createdBy: session.user.id,
        deployedBy: session.user.id,
      },
    });

    return NextResponse.json({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function getExampleAgents() {
  // In a real application, you would fetch this from a database.
  // We'll add a short delay to simulate a network request.
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return exampleAgents;
} 