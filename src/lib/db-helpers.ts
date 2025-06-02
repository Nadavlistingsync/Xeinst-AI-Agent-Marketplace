import { Prisma } from "@prisma/client";
import { prisma } from "./db";

// Product operations
export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      uploader: {
        select: {
          name: true,
          image: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

export async function getProducts(params: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const { query, category, minPrice, maxPrice } = params;

  const where: Prisma.ProductWhereInput = {
    isPublic: true,
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  return prisma.product.findMany({
    where,
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      uploader: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { 
      isPublic: true,
      isFeatured: true 
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { 
      isPublic: true,
      category 
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getProductsByUser(user_id: string) {
  return prisma.product.findMany({
    where: { 
      OR: [
        { created_by: user_id },
        { uploaded_by: user_id }
      ]
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({
    data,
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      uploader: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      uploader: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

// Review operations
export async function getProductReviews(product_id: string) {
  return prisma.review.findMany({
    where: { product_id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function createReview(data: Prisma.ReviewCreateInput) {
  return prisma.review.create({
    data,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function getUserReview(product_id: string, user_id: string) {
  return prisma.review.findFirst({
    where: {
      product_id,
      user_id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

// Purchase operations
export async function getUserPurchases(user_id: string) {
  return prisma.purchase.findMany({
    where: { user_id },
    include: {
      product: {
        include: {
          creator: {
            select: {
              name: true,
              image: true,
            },
          },
          uploader: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getUserProducts(user_id: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { created_by: user_id },
        { uploaded_by: user_id },
      ],
    },
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      uploader: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

// Deployment operations
export async function getDeployments(params: {
  query?: string;
  framework?: string;
  access_level?: string;
  licenseType?: string;
}) {
  const { query, framework, access_level, licenseType } = params;

  const where: Prisma.DeploymentWhereInput = {
    status: "active",
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (framework) {
    where.framework = framework;
  }

  if (access_level) {
    where.access_level = access_level;
  }

  if (licenseType) {
    where.licenseType = licenseType;
  }

  return prisma.deployment.findMany({
    where,
    include: {
      deployer: {
        select: {
          name: true,
          image: true,
        },
      },
      metrics: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getDeployment(id: string) {
  return prisma.deployment.findUnique({
    where: { id },
    include: {
      deployer: {
        select: {
          name: true,
          image: true,
        },
      },
      metrics: true,
      logs: true,
      feedbacks: true,
    },
  });
}

export async function createDeployment(data: Prisma.DeploymentCreateInput) {
  return prisma.deployment.create({
    data,
    include: {
      deployer: {
        select: {
          name: true,
          image: true,
        },
      },
      metrics: true,
      logs: true,
      feedbacks: true,
    },
  });
}

export async function updateDeployment(id: string, data: Prisma.DeploymentUpdateInput) {
  return prisma.deployment.update({
    where: { id },
    data,
    include: {
      deployer: {
        select: {
          name: true,
          image: true,
        },
      },
      metrics: true,
      logs: true,
      feedbacks: true,
    },
  });
}

export async function deleteDeployment(id: string) {
  return prisma.deployment.delete({
    where: { id },
  });
}

// Feedback operations
export async function getAgentFeedback(agentId: string) {
  return prisma.agentFeedback.findMany({
    where: { agentId },
    include: { user: true },
    orderBy: { created_at: 'desc' }
  });
}

export async function createAgentFeedback(data: any) {
  return prisma.agentFeedback.create({
    data
  });
}

// Notification operations
export async function getUserNotifications(user_id: string) {
  return prisma.notification.findMany({
    where: { user_id },
    orderBy: { created_at: 'desc' }
  });
}

export async function createNotification(data: any) {
  return prisma.notification.create({
    data
  });
}

// Metrics operations
export async function getAgentMetrics(agentId: string) {
  return prisma.agentMetrics.findUnique({
    where: { agentId }
  });
}

export async function updateAgentMetrics(agentId: string, data: any) {
  return prisma.agentMetrics.upsert({
    where: { agentId },
    update: data,
    create: {
      agentId,
      ...data
    }
  });
}

// Log operations
export async function getAgentLogs(agentId: string) {
  return prisma.agentLog.findMany({
    where: { agentId },
    orderBy: { timestamp: 'desc' }
  });
}

export async function createAgentLog(data: any) {
  return prisma.agentLog.create({
    data
  });
} 