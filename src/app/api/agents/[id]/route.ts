import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db-helpers';
import { deleteFileFromS3 } from '@/lib/s3-helpers';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const updates = await request.json();

    // Check if user owns the agent
    const agent = await getProductById(id);
    if (!agent || agent.uploaded_by !== session.user.id) {
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
      is_public: updates.is_public,
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
  req: Request,
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
    if (!agent || agent.uploaded_by !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this agent' },
        { status: 403 }
      );
    }

    // Delete the file from S3 if it exists
    if (agent.file_url) {
      try {
        await deleteFileFromS3(agent.file_url);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
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

    const agent = await prisma.deployments.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
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

    const agent = await prisma.deployments.findUnique({
      where: { id: params.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.deployed_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this agent' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updatedAgent = await prisma.deployments.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        access_level: body.access_level,
        license_type: body.license_type,
        price_cents: body.price_cents,
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