import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateDeploymentSchema = z.object({
  status: z.enum(["pending", "deploying", "active", "failed", "stopped"]).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  framework: z.string().optional(),
  version: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        metrics: true,
      },
    });

    if (!deployment) {
      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deployment);
  } catch (error) {
    console.error("Error fetching deployment:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployment" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    switch (action) {
      case "deploy": {
        const deployment = await prisma.deployment.update({
          where: { id: params.id },
          data: {
            status: "active",
            deployedBy: session.user.id,
          },
        });
        return NextResponse.json(deployment);
      }

      case "undeploy": {
        // deployedBy cannot be set to null because the schema does not allow null
        // Instead, we can set it to the current user or leave it unchanged
        const deployment = await prisma.deployment.update({
          where: { id: params.id },
          data: {
            status: "stopped",
            deployedBy: session.user.id, // fallback to current user
          },
        });
        return NextResponse.json(deployment);
      }

      case "delete": {
        const deployment = await prisma.deployment.delete({
          where: { id: params.id },
        });
        return NextResponse.json(deployment);
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error performing deployment action:", error);
    return NextResponse.json(
      { error: "Failed to perform deployment action" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const validatedData = updateDeploymentSchema.parse(data);
    
    const deployment = await prisma.deployment.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(deployment);
  } catch (error) {
    console.error("Error updating deployment:", error);
    return NextResponse.json(
      { error: "Failed to update deployment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await _req.json();
    const validatedData = updateDeploymentSchema.parse(body);

    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
    });

    if (!deployment) {
      return new NextResponse("Deployment not found", { status: 404 });
    }

    // Check if user has access to update this deployment
    if (deployment.createdBy !== session.user.id) {
      return new NextResponse("Unauthorized to update this deployment", { status: 403 });
    }

    const updatedDeployment = await prisma.deployment.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedDeployment);
  } catch (error) {
    console.error("[DEPLOYMENT_PATCH]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
    });

    if (!deployment) {
      return new NextResponse("Deployment not found", { status: 404 });
    }

    // Check if user has access to delete this deployment
    if (deployment.createdBy !== session.user.id) {
      return new NextResponse("Unauthorized to delete this deployment", { status: 403 });
    }

    // Delete associated metrics and logs first
    await Promise.all([
      prisma.agentMetrics.deleteMany({
        where: { deploymentId: params.id },
      }),
      prisma.agentLog.deleteMany({
        where: { deploymentId: params.id },
      }),
    ]);

    // Delete the deployment
    await prisma.deployment.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DEPLOYMENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 