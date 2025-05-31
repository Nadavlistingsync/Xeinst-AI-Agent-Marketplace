import { prisma } from './prisma';

// Product operations
export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id }
  });
}

export async function getProducts() {
  return prisma.product.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { 
      isPublic: true,
      isFeatured: true 
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { 
      isPublic: true,
      category 
    },
    orderBy: { createdAt: 'desc' }
  });
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
  });
}

export async function createProduct(data: any) {
  return prisma.product.create({
    data
  });
}

export async function updateProduct(id: string, data: any) {
  return prisma.product.update({
    where: { id },
    data
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id }
  });
}

// Review operations
export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createReview(data: any) {
  return prisma.review.create({
    data
  });
}

// Purchase operations
export async function getPurchasesByUser(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createPurchase(data: any) {
  return prisma.purchase.create({
    data
  });
}

// Deployment operations
export async function getDeploymentsByUser(userId: string) {
  return prisma.deployment.findMany({
    where: { deployedBy: userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createDeployment(data: any) {
  return prisma.deployment.create({
    data
  });
}

// Feedback operations
export async function getAgentFeedback(agentId: string) {
  return prisma.agentFeedback.findMany({
    where: { agentId },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createAgentFeedback(data: any) {
  return prisma.agentFeedback.create({
    data
  });
}

// Notification operations
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
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