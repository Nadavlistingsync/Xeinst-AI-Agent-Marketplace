import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse } from '@/lib/error-handling';
import path from 'path';
import fs from 'fs';

// This function checks if the user is authorized to download the agent
async function canDownloadAgent(agentId: string, userId: string): Promise<{ authorized: boolean; error?: string; agent?: any }> {
  const agent = await prisma.deployment.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    return { authorized: false, error: 'Agent not found' };
  }

  // If agent is free, anyone can download
  if (agent.price === 0) {
    return { authorized: true, agent };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { authorized: false, error: 'User not found' };
  }

  // Check if user has enough credits
  if ((user.credits ?? 0) < (agent.price ?? 0)) {
    return { authorized: false, error: 'Insufficient credits' };
  }

  return { authorized: true, agent };
}


export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { authorized, error, agent } = await canDownloadAgent(params.id, session.user.id);
    if (!authorized || !agent) {
      return createErrorResponse(error || 'Forbidden', 403);
    }
    
    // Deduct credits if the agent is not free
    if (agent.price > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: agent.price,
          },
        },
      });
    }

    // Increment download count
    await prisma.deployment.update({
      where: { id: params.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // For now, let's assume a dummy file path.
    // In a real app, this would point to the agent's file in S3 or another storage.
    const filePath = path.join(process.cwd(), 'README.md'); 
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${agent.name}.zip"`, // Pretend it's a zip
      },
    });

  } catch (error) {
    return createErrorResponse(error);
  }
} 