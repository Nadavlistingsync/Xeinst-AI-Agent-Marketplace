import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db-helpers';
import { unlink } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();

    // Check if user owns the agent
    const agent = await getProductById(id);
    if (!agent || agent.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this agent' },
        { status: 403 }
      );
    }

    // Update the agent
    const updatedAgent = await updateProduct(id, {
      name: updates.name,
      description: updates.description,
      price: updates.price,
      features: updates.features,
      requirements: updates.requirements,
      isPublic: updates.isPublic,
      updated_at: new Date(),
    });

    return NextResponse.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user owns the agent
    const agent = await getProductById(id);
    if (!agent || agent.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this agent' },
        { status: 403 }
      );
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
    await deleteProduct(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        users: {
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
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.deployedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this agent' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updatedAgent = await prisma.deployment.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        accessLevel: body.accessLevel,
        licenseType: body.licenseType,
        priceCents: body.priceCents,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 