import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DeploymentStatus } from "@prisma/client";
import { isDatabaseAvailable, createDatabaseErrorResponse } from "@/lib/db-check";

const deploymentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string(),
  framework: z.string(),
  version: z.string(),
  requirements: z.array(z.string()),
  accessLevel: z.enum(['public', 'private', 'premium']).optional(),
  licenseType: z.enum(['free', 'pro', 'enterprise']).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  modelType: z.enum(['gpt-3.5-turbo', 'gpt-4', 'claude-2']).optional(),
  source: z.enum(['marketplace', 'custom', 'template']).optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }

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
        createdBy: session.user.id,
        deployedBy: session.user.id,
        status: DeploymentStatus.active,
        name: validatedData.name,
        description: validatedData.description,
        framework: validatedData.framework,
        version: validatedData.version,
        accessLevel: validatedData.accessLevel || 'public',
        licenseType: validatedData.licenseType || 'free',
        environment: validatedData.environment || 'production',
        modelType: validatedData.modelType || 'gpt-3.5-turbo',
        source: validatedData.source || 'marketplace'
      },
    });

    // Create initial metrics
    await prisma.agentMetrics.create({
      data: {
        deploymentId: deployment.id,
        errorRate: 0,
        successRate: 0,
        activeUsers: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        requestsPerMinute: 0,
        averageTokensUsed: 0,
        costPerRequest: 0,
        totalCost: 0,
        responseTime: 0
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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // If userId is provided, only return deployments for that user
    const where = userId ? { createdBy: userId } : { isPublic: true };

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