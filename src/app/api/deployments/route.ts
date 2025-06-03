import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const deploymentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string(),
  framework: z.string(),
  version: z.string(),
  requirements: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = deploymentSchema.parse(body);

    // Create the deployment
    const deployment = await prisma.deployment.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        deployedBy: session.user.id,
        status: 'active',
      },
    });

    // Create initial metrics
    await prisma.agentMetrics.create({
      data: {
        agentId: deployment.id,
      },
    });

    return NextResponse.json(deployment);
  } catch (error) {
    console.error("[DEPLOYMENTS_POST]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // If userId is provided, only return deployments for that user
    const where = userId ? { createdBy: userId } : {};

    const deployments = await prisma.deployment.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            image: true,
          },
        },
        metrics: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error("[DEPLOYMENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 