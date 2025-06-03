import { Prisma } from '@prisma/client';

export type Deployment = Prisma.DeploymentGetPayload<{}>;
export type AgentFeedback = Prisma.AgentFeedbackGetPayload<{}>;
export type AgentMetrics = Prisma.AgentMetricsGetPayload<{}>;
export type AgentLog = Prisma.AgentLogGetPayload<{}>;
export type Product = Prisma.ProductGetPayload<{}>;
export type Review = Prisma.ReviewGetPayload<{}>;
export type Purchase = Prisma.PurchaseGetPayload<{}>;
export type Earning = Prisma.EarningGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;
export type Notification = Prisma.NotificationGetPayload<{}>;
export type File = Prisma.FileGetPayload<{}>;

export type DeploymentCreateInput = Prisma.DeploymentCreateInput;
export type DeploymentUpdateInput = Prisma.DeploymentUpdateInput;
export type DeploymentWhereInput = Prisma.DeploymentWhereInput;
export type DeploymentWhereUniqueInput = Prisma.DeploymentWhereUniqueInput;
export type DeploymentOrderByWithRelationInput = Prisma.DeploymentOrderByWithRelationInput;
export type DeploymentInclude = Prisma.DeploymentInclude;

export type AgentFeedbackCreateInput = Prisma.AgentFeedbackCreateInput;
export type AgentFeedbackUpdateInput = Prisma.AgentFeedbackUpdateInput;
export type AgentFeedbackWhereInput = Prisma.AgentFeedbackWhereInput;
export type AgentFeedbackWhereUniqueInput = Prisma.AgentFeedbackWhereUniqueInput;
export type AgentFeedbackOrderByWithRelationInput = Prisma.AgentFeedbackOrderByWithRelationInput;
export type AgentFeedbackInclude = Prisma.AgentFeedbackInclude;

export type AgentMetricsCreateInput = Prisma.AgentMetricsCreateInput;
export type AgentMetricsUpdateInput = Prisma.AgentMetricsUpdateInput;
export type AgentMetricsWhereInput = Prisma.AgentMetricsWhereInput;
export type AgentMetricsWhereUniqueInput = Prisma.AgentMetricsWhereUniqueInput;
export type AgentMetricsOrderByWithRelationInput = Prisma.AgentMetricsOrderByWithRelationInput;
export type AgentMetricsInclude = Prisma.AgentMetricsInclude;

export type ProductCreateInput = Prisma.ProductCreateInput;
export type ProductUpdateInput = Prisma.ProductUpdateInput;
export type ProductWhereInput = Prisma.ProductWhereInput;
export type ProductWhereUniqueInput = Prisma.ProductWhereUniqueInput;
export type ProductOrderByWithRelationInput = Prisma.ProductOrderByWithRelationInput;
export type ProductInclude = Prisma.ProductInclude;

export type ReviewCreateInput = Prisma.ReviewCreateInput;
export type ReviewUpdateInput = Prisma.ReviewUpdateInput;
export type ReviewWhereInput = Prisma.ReviewWhereInput;
export type ReviewWhereUniqueInput = Prisma.ReviewWhereUniqueInput;
export type ReviewOrderByWithRelationInput = Prisma.ReviewOrderByWithRelationInput;
export type ReviewInclude = Prisma.ReviewInclude;

export type PurchaseCreateInput = Prisma.PurchaseCreateInput;
export type PurchaseUpdateInput = Prisma.PurchaseUpdateInput;
export type PurchaseWhereInput = Prisma.PurchaseWhereInput;
export type PurchaseWhereUniqueInput = Prisma.PurchaseWhereUniqueInput;
export type PurchaseOrderByWithRelationInput = Prisma.PurchaseOrderByWithRelationInput;
export type PurchaseInclude = Prisma.PurchaseInclude;

export type EarningCreateInput = Prisma.EarningCreateInput;
export type EarningUpdateInput = Prisma.EarningUpdateInput;
export type EarningWhereInput = Prisma.EarningWhereInput;
export type EarningWhereUniqueInput = Prisma.EarningWhereUniqueInput;
export type EarningOrderByWithRelationInput = Prisma.EarningOrderByWithRelationInput;
export type EarningInclude = Prisma.EarningInclude;

export type NotificationCreateInput = Prisma.NotificationCreateInput;
export type NotificationUpdateInput = Prisma.NotificationUpdateInput;
export type NotificationWhereInput = Prisma.NotificationWhereInput;
export type NotificationWhereUniqueInput = Prisma.NotificationWhereUniqueInput;
export type NotificationOrderByWithRelationInput = Prisma.NotificationOrderByWithRelationInput;
export type NotificationInclude = Prisma.NotificationInclude;

export type FileCreateInput = Prisma.FileCreateInput;
export type FileUpdateInput = Prisma.FileUpdateInput;
export type FileWhereInput = Prisma.FileWhereInput;
export type FileWhereUniqueInput = Prisma.FileWhereUniqueInput;
export type FileOrderByWithRelationInput = Prisma.FileOrderByWithRelationInput;
export type FileInclude = Prisma.FileInclude; 