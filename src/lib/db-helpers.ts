import { Prisma } from '@prisma/client';
import type { Deployment } from '@/types/prisma';
import { prisma } from "./prisma";

// Define types
export type ProductType = 'template' | 'custom' | 'plugin';

export type ProductWithNumbers = {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  purchaseCount: number;
  deploymentCount: number;
  category: string;
};

export type PurchaseWithProduct = {
  id: string;
  userId: string;
  productId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  stripeTransferId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product: ProductWithNumbers;
};

// Product operations
export async function getProduct(id: string): Promise<ProductWithNumbers | null> {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      fileUrl: true,
      rating: true,
      downloadCount: true,
      requirements: true,
      longDescription: true,
      price: true,
      category: true,
      tags: true,
      version: true,
      status: true,
      accessLevel: true,
      licenseType: true,
      environment: true,
      framework: true,
      modelType: true,
      createdBy: true,
      earningsSplit: true,
      isPublic: true,
      uploadedBy: true,
      createdAt: true,
      updatedAt: true,
    },
  }).then((product) =>
    product
      ? {
          ...product,
          price: Number(product.price),
          earningsSplit: Number((product as any).earningsSplit ?? 0),
          type: "template",
          features: [],
          purchaseCount: 0,
          deploymentCount: 0,
        }
      : null
  );
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
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
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
    earningsSplit: Number(p.earningsSplit),
    type: 'template' as ProductType,
    features: [],
    purchaseCount: 0,
    deploymentCount: 0
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
      product: true
    }
  }).then(purchases => purchases.map(purchase => ({
    ...purchase,
    status: purchase.status as 'pending' | 'completed' | 'failed',
    amount: Number(purchase.amount),
    currency: 'USD',
    product: {
      id: purchase.product.id,
      name: purchase.product.name,
      description: purchase.product.description,
      type: 'template',
      price: Number(purchase.product.price),
      features: [],
      createdAt: purchase.product.createdAt,
      updatedAt: purchase.product.updatedAt,
      purchaseCount: 0,
      deploymentCount: 0,
      category: purchase.product.category
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
  const deployment = await prisma.deployment.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
      metrics: true,
    },
  });

  if (!deployment) return null;

  // Manually construct the final object to match the Deployment type
  // This ensures all fields are present, even if some relations are null
  return {
    ...deployment,
    name: deployment.name || 'Untitled Agent',
    description: deployment.description || 'No description available.',
    // Add other fields from the Deployment model, with defaults if necessary
  };
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
    where: { id }
  }).then(product => product ? {
    id: product.id,
    name: product.name,
    description: product.description,
    type: 'template',
    price: Number(product.price),
    features: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    purchaseCount: 0,
    deploymentCount: 0,
    category: product.category
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
    where: { createdBy: creatorId }
  }).then(products => products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    type: 'template',
    price: Number(product.price),
    features: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    purchaseCount: 0,
    deploymentCount: 0,
    category: product.category
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
    }
  }).then(products => products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    type: 'template',
    price: Number(product.price),
    features: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    purchaseCount: 0,
    deploymentCount: 0,
    category: product.category
  })));
}

// Helper functions
export async function getProductWithStats(
  prisma: any,
  productId: string
): Promise<ProductWithNumbers | null> {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      category: true,
    },
  }).then((product: any) => product ? {
    id: product.id,
    name: product.name,
    description: product.description,
    type: 'template',
    price: Number(product.price),
    features: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    purchaseCount: 0,
    deploymentCount: 0,
    category: product.category
  } : null);
}

export async function getPurchaseWithProduct(
  prisma: any,
  purchaseId: string
): Promise<PurchaseWithProduct | null> {
  return prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      product: true
    }
  }).then((purchase: any) => purchase ? {
    ...purchase,
    status: purchase.status as 'pending' | 'completed' | 'failed',
    amount: Number(purchase.amount),
    currency: 'USD',
    product: {
      id: purchase.product.id,
      name: purchase.product.name,
      description: purchase.product.description,
      type: 'template',
      price: Number(purchase.product.price),
      features: [],
      createdAt: purchase.product.createdAt,
      updatedAt: purchase.product.updatedAt,
      purchaseCount: 0,
      deploymentCount: 0,
      category: purchase.product.category
    }
  } : null);
} 