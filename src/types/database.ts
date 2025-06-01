import { type Prisma } from '@prisma/client';

export type Feedback = Prisma.FeedbackGetPayload<{
  select: {
    id: true;
    agentId: true;
    userId: true;
    rating: true;
    comment: true;
    metadata: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type Agent = Prisma.AgentGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    status: true;
    metadata: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    role: true;
    metadata: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type Product = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    price: true;
    status: true;
    metadata: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type Notification = Prisma.NotificationGetPayload<{
  select: {
    id: true;
    userId: true;
    type: true;
    title: true;
    message: true;
    severity: true;
    metadata: true;
    read: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type Review = Prisma.ReviewGetPayload<{
  select: {
    id: true;
    productId: true;
    userId: true;
    rating: true;
    comment: true;
    metadata: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type Metrics = Prisma.MetricsGetPayload<{
  select: {
    id: true;
    agentId: true;
    totalRequests: true;
    averageResponseTime: true;
    errorRate: true;
    successRate: true;
    activeUsers: true;
    requestsPerMinute: true;
    averageTokensUsed: true;
    costPerRequest: true;
    totalCost: true;
    timestamp: true;
  };
}>; 