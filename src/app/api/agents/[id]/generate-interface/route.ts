import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiInterfaceGenerator, AIGenerationOptions } from '@/lib/ai-interface-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const options: AIGenerationOptions = body.options || {};

    // Fetch the agent from database
    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if user owns the agent or if it's public
    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate the interface using AI
    const generatedInterface = await aiInterfaceGenerator.generateInterface(agent, options);

    // Generate React component code
    const reactComponent = await aiInterfaceGenerator.generateReactComponent(generatedInterface);

    // Save the generated interface to database
    const savedInterface = await prisma.generatedInterface.create({
      data: {
        id: generatedInterface.id,
        agentId: agent.id,
        components: JSON.parse(JSON.stringify(generatedInterface.components)),
        styles: generatedInterface.styles,
        layout: generatedInterface.layout,
        metadata: JSON.parse(JSON.stringify(generatedInterface.metadata)),
        reactCode: reactComponent,
        createdBy: session.user.id,
      }
    });

    return NextResponse.json({
      success: true,
      interface: {
        ...generatedInterface,
        reactCode: reactComponent,
        id: savedInterface.id
      }
    });

  } catch (error) {
    console.error('Error generating interface:', error);
    return NextResponse.json(
      { error: 'Failed to generate interface' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const interfaceId = searchParams.get('interfaceId');

    if (interfaceId) {
      // Fetch specific interface
      const generatedInterface = await prisma.generatedInterface.findUnique({
        where: { id: interfaceId },
        include: { agent: true }
      });

      if (!generatedInterface) {
        return NextResponse.json(
          { error: 'Interface not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        interface: generatedInterface
      });
    } else {
      // Fetch all interfaces for this agent
      const interfaces = await prisma.generatedInterface.findMany({
        where: { agentId: id },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        interfaces
      });
    }

  } catch (error) {
    console.error('Error fetching interfaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interfaces' },
      { status: 500 }
    );
  }
} 