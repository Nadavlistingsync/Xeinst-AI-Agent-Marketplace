import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  accessLevel: z.enum(['public', 'private', 'restricted']),
  licenseType: z.enum(['free', 'premium', 'enterprise']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    const { id } = params;
    const updates = await request.json();

    // Validate the update data
    const validatedUpdates = updateAgentSchema.parse(updates);

    // Check if user owns the agent
    const agent = await prisma.deployment.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!agent || agent.createdBy !== session.user.id) {
      return createErrorResponse('You do not have permission to edit this agent');
    }

    // Update the agent
    const updatedAgent = await prisma.deployment.update({
      where: { id },
      data: {
        ...validatedUpdates,
        updatedAt: new Date(),
      },
    });

    return createSuccessResponse({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid update data');
    }
    return createErrorResponse('Internal server error');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    const { id } = params;

    // Check if user owns the agent
    const agent = await prisma.deployment.findUnique({
      where: { id },
      select: { 
        createdBy: true,
        fileUrl: true
      }
    });

    if (!agent || agent.createdBy !== session.user.id) {
      return createErrorResponse('You do not have permission to delete this agent');
    }

    // Delete the file from local storage if it exists
    if (agent.fileUrl) {
      try {
        const filePath = join(UPLOAD_DIR, agent.fileUrl.split('/').pop() || '');
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete the agent from the database
    await prisma.deployment.delete({
      where: { id }
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return createErrorResponse('Internal server error');
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          },
        },
      },
    });

    if (!agent) {
      return createErrorResponse('Agent not found');
    }

    return createSuccessResponse(agent);
  } catch (error) {
    console.error('Error fetching agent details:', error);
    return createErrorResponse('Internal server error');
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: { createdBy: true }
    });

    if (!agent) {
      return createErrorResponse('Agent not found');
    }

    if (agent.createdBy !== session.user.id) {
      return createErrorResponse('Not authorized to update this agent');
    }

    const body = await req.json();
    const validatedUpdates = updateAgentSchema.parse(body);

    const updatedAgent = await prisma.deployment.update({
      where: { id: params.id },
      data: {
        ...validatedUpdates,
        updatedAt: new Date(),
      },
    });

    return createSuccessResponse(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid update data');
    }
    return createErrorResponse('Internal server error');
  }
} 