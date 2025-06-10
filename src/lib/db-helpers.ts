import { PrismaClient, Prisma, Deployment, Product, Purchase } from "@prisma/client";
import { prisma } from "./db";
import type { ProductWithNumbers, PurchaseWithProduct } from './schema';

// Define types
export type ProductType = 'template' | 'custom' | 'plugin';

export interface ProductWithNumbers {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  downloadCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseWithProduct {
  id: string;
  userId: string;
  productId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  product: ProductWithNumbers;
}

// Product operations
export async function getProduct(id: string): Promise<ProductWithNumbers | null> {
  return prisma.product.findUnique({
    where: { id },
    include: {
      creator: {
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
  }).then((product) => product ? { ...product, price: Number(product.price), earningsSplit: Number(product.earningsSplit) } : null);
}

export interface GetProductsParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getProducts(params: GetProductsParams) {
  const { query, category, minPrice, maxPrice } = params;

  const where: Prisma.ProductWhereInput = {};

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
    },
    orderBy: {
      createdAt: "desc",
    },
  }).then((products: ProductType[]) => products.map((p: ProductType) => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { 
      isPublic: true,
      status: 'published'
    },
    orderBy: { 
      rating: 'desc'
    },
    take: 10
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
}

export async function getProductsByCategory(category: string): Promise<ProductWithNumbers[]> {
  return prisma.product.findMany({
    where: {
      category,
      status: 'published'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(products => products.map(p => ({
    ...p,
    price: Number(p.price),
    earningsSplit: Number(p.earningsSplit)
  })));
}

export async function getProductsByUser(userId: string) {
  return prisma.product.findMany({
    where: { 
      OR: [
        { createdBy: userId },
        { uploadedBy: userId }
      ]
    },
    orderBy: { createdAt: 'desc' }
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
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
    },
  }).then(product => product ? { ...product, price: Number(product.price), earningsSplit: Number(product.earningsSplit) } : null);
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
    },
  }).then(product => product ? { ...product, price: Number(product.price), earningsSplit: Number(product.earningsSplit) } : null);
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

// Review operations
export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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

export async function getUserReview(productId: string, userId: string) {
  return prisma.review.findFirst({
    where: {
      productId,
      userId,
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
export async function getUserPurchases(userId: string): Promise<PurchaseWithProduct[]> {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }).then((purchases) => purchases.map((p) => ({
    ...p,
    amount: Number(p.amount),
    product: {
      ...p.product,
      price: Number(p.product.price),
      earningsSplit: Number(p.product.earningsSplit)
    }
  })));
}

export async function getUserProducts(userId: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { createdBy: userId },
        { uploadedBy: userId }
      ]
    },
    orderBy: { createdAt: 'desc' }
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
}

// Deployment operations
export interface DeploymentFilters {
  query?: string;
  framework?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getDeployments(filters?: DeploymentFilters): Promise<Deployment[]> {
  const where: Prisma.DeploymentWhereInput = {};

  if (filters?.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { description: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters?.framework) where.framework = filters.framework;

  return prisma.deployment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDeploymentById(id: string): Promise<Deployment | null> {
  return prisma.deployment.findUnique({
    where: { id },
  });
}

export async function getDeploymentMetrics(id: string) {
  return prisma.deployment.findUnique({
    where: { id },
    select: {
      metrics: true,
    },
  });
}

export async function createDeployment(data: Prisma.DeploymentCreateInput) {
  return prisma.deployment.create({
    data: {
      ...data,
      status: 'pending',
      startDate: new Date(),
      rating: 0,
      totalRatings: 0,
      downloadCount: 0,
      health: Prisma.JsonNull,
    },
  });
}

export async function updateDeployment(id: string, data: Prisma.DeploymentUpdateInput) {
  return prisma.deployment.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteDeployment(id: string) {
  return prisma.deployment.delete({
    where: { id },
  });
}

export async function updateDeploymentMetrics(id: string, metrics: any) {
  return prisma.deployment.update({
    where: { id },
    data: {
      metrics: metrics,
    },
  });
}

export async function incrementDownloadCount(id: string) {
  return prisma.deployment.update({
    where: { id },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
}

export async function updateDeploymentRating(id: string, rating: number) {
  const deployment = await prisma.deployment.findUnique({
    where: { id },
    select: {
      totalRatings: true,
      rating: true,
    },
  });

  if (!deployment) return null;

  const newTotalRatings = (deployment.totalRatings || 0) + 1;
  const newRating = ((deployment.rating || 0) * (deployment.totalRatings || 0) + rating) / newTotalRatings;

  return prisma.deployment.update({
    where: { id },
    data: {
      rating: newRating,
      totalRatings: newTotalRatings,
    },
  });
}

// Agent feedback operations
export async function getAgentFeedback(deploymentId: string) {
  return prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAgentFeedback(data: Prisma.AgentFeedbackCreateInput) {
  return prisma.agentFeedback.create({
    data,
  });
}

// Notification operations
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createNotification(data: Prisma.NotificationCreateInput) {
  return prisma.notification.create({
    data,
  });
}

// Agent metrics operations
export async function getAgentMetrics(deploymentId: string) {
  return prisma.agentMetrics.findMany({
    where: { deploymentId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function updateAgentMetrics(deploymentId: string, data: Prisma.AgentMetricsUpdateInput) {
  return prisma.agentMetrics.updateMany({
    where: { deploymentId },
    data,
  });
}

// Agent logs operations
export async function getAgentLogs(deploymentId: string) {
  return prisma.agentLog.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAgentLog(data: Prisma.AgentLogCreateInput) {
  return prisma.agentLog.create({
    data,
  });
}

// Product operations
export async function getProductById(id: string): Promise<ProductWithNumbers | null> {
  return prisma.product.findUnique({
    where: {
      id
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(product => product ? {
    ...product,
    price: Number(product.price),
    earningsSplit: Number(product.earningsSplit)
  } : null);
}

// Deployment operations
export async function getDeployment(id: string) {
  return prisma.deployment.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      deployer: {
        select: {
          name: true,
          image: true,
        },
      },
      feedbacks: {
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

export async function getDeploymentFeedbacks(id: string) {
  return prisma.agentFeedback.findMany({
    where: { deploymentId: id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAgentFeedbackById(id: string) {
  return prisma.agentFeedback.findUnique({
    where: { id },
  });
}

export async function getAgentFeedbacksByDeploymentId(deploymentId: string) {
  return prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductsByCreator(creatorId: string): Promise<ProductWithNumbers[]> {
  return prisma.product.findMany({
    where: {
      createdBy: creatorId
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(products => products.map(p => ({
    ...p,
    price: Number(p.price),
    earningsSplit: Number(p.earningsSplit)
  })));
}

export async function searchProducts(query: string): Promise<ProductWithNumbers[]> {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ],
      status: 'published'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(products => products.map(p => ({
    ...p,
    price: Number(p.price),
    earningsSplit: Number(p.earningsSplit)
  })));
}

// Helper functions
export async function getProductWithStats(
  prisma: PrismaClient,
  productId: string
): Promise<ProductWithNumbers | null> {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      type: true,
      downloadCount: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getPurchaseWithProduct(
  prisma: PrismaClient,
  purchaseId: string
): Promise<PurchaseWithProduct | null> {
  return prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          type: true,
          downloadCount: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
} 