-- =============================================================================
-- AI Agency Website - Supabase Database Setup SQL
-- =============================================================================
-- This script creates the complete database schema for the AI Agency Website
-- Optimized for Supabase PostgreSQL with RLS policies and Supabase features
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User Role Enum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'agent');

-- Subscription Tier Enum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'basic', 'premium');

-- Deployment Status Enum
CREATE TYPE "DeploymentStatus" AS ENUM ('pending', 'deploying', 'active', 'failed', 'stopped');

-- Notification Type Enum
CREATE TYPE "NotificationType" AS ENUM ('feedback_received', 'deployment_status', 'system_alert', 'feedback_alert');

-- Product Status Enum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'published', 'archived');

-- Product Access Level Enum
CREATE TYPE "ProductAccessLevel" AS ENUM ('public', 'private', 'restricted');

-- Product License Type Enum
CREATE TYPE "ProductLicenseType" AS ENUM ('free', 'commercial', 'enterprise');

-- Web Embed Status Enum
CREATE TYPE "WebEmbedStatus" AS ENUM ('active', 'inactive', 'pending', 'error');

-- Web Embed Type Enum
CREATE TYPE "WebEmbedType" AS ENUM ('website', 'application', 'dashboard', 'tool', 'custom');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users Table (extends Supabase auth.users)
CREATE TABLE "User" (
    "id" UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "credits" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "stripeConnectId" TEXT,
    "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT false
);

-- Products Table
CREATE TABLE "Product" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "requirements" TEXT[],
    "longDescription" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "version" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "accessLevel" "ProductAccessLevel" NOT NULL DEFAULT 'public',
    "licenseType" "ProductLicenseType" NOT NULL DEFAULT 'free',
    "environment" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "createdBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "earningsSplit" DOUBLE PRECISION NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" UUID REFERENCES "User"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Deployments Table
CREATE TABLE "Deployment" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'pending',
    "description" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "deployedBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "createdBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "health" JSONB DEFAULT '{}',
    "pricePerRun" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER DEFAULT 0
);

-- Agent Feedback Table
CREATE TABLE "AgentFeedback" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "deploymentId" UUID NOT NULL REFERENCES "Deployment"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "comment" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "categories" JSONB,
    "creatorResponse" TEXT,
    "responseDate" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Agent Table (moved before Review table to fix circular reference)
CREATE TABLE "Agent" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "documentation" TEXT,
    "fileUrl" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "framework" TEXT NOT NULL DEFAULT 'custom',
    "modelType" TEXT NOT NULL DEFAULT 'custom',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "config" JSONB
);

-- Reviews Table
CREATE TABLE "Review" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "deploymentId" UUID NOT NULL REFERENCES "Deployment"(id) ON DELETE CASCADE,
    "agentId" UUID REFERENCES "Agent"(id) ON DELETE SET NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "productId" UUID REFERENCES "Product"(id) ON DELETE SET NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Purchases Table
CREATE TABLE "Purchase" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE RESTRICT,
    "amount" DOUBLE PRECISION NOT NULL,
    "stripeTransferId" TEXT,
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Earnings Table
CREATE TABLE "Earning" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE RESTRICT,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripeTransferId" TEXT,
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE "Notification" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Agent Metrics Table
CREATE TABLE "AgentMetrics" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "deploymentId" UUID NOT NULL REFERENCES "Deployment"(id) ON DELETE CASCADE,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestsPerMinute" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageTokensUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerRequest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "lastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Agent Logs Table
CREATE TABLE "AgentLog" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "deploymentId" UUID REFERENCES "Deployment"(id) ON DELETE SET NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Files Table
CREATE TABLE "File" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "productId" UUID REFERENCES "Product"(id) ON DELETE SET NULL,
    "uploadedBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT
);


-- Web Embed Table
CREATE TABLE "WebEmbed" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "type" "WebEmbedType" NOT NULL DEFAULT 'website',
    "status" "WebEmbedStatus" NOT NULL DEFAULT 'active',
    "createdBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "width" TEXT NOT NULL DEFAULT '100%',
    "height" TEXT NOT NULL DEFAULT '600px',
    "allowFullscreen" BOOLEAN NOT NULL DEFAULT true,
    "allowScripts" BOOLEAN NOT NULL DEFAULT false,
    "sandbox" TEXT NOT NULL DEFAULT 'allow-same-origin allow-scripts allow-forms allow-popups',
    "agentId" UUID REFERENCES "Agent"(id) ON DELETE SET NULL,
    "agentConfig" JSONB,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requireAuth" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewed" TIMESTAMP WITH TIME ZONE
);

-- Web Embed Log Table
CREATE TABLE "WebEmbedLog" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "embedId" UUID NOT NULL REFERENCES "WebEmbed"(id) ON DELETE CASCADE,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Credit Transaction Table
CREATE TABLE "CreditTransaction" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "agentId" UUID REFERENCES "Agent"(id) ON DELETE SET NULL,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Webhook Log Table
CREATE TABLE "WebhookLog" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "agentId" UUID NOT NULL REFERENCES "Agent"(id) ON DELETE CASCADE,
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "payloadSize" INTEGER NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Agent Version Table
CREATE TABLE "AgentVersion" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "agentId" UUID NOT NULL REFERENCES "Agent"(id) ON DELETE CASCADE,
    "version" TEXT NOT NULL,
    "changelog" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- User indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_subscriptionTier_idx" ON "User"("subscriptionTier");

-- Product indexes
CREATE INDEX "Product_createdBy_idx" ON "Product"("createdBy");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- Deployment indexes
CREATE INDEX "Deployment_createdBy_idx" ON "Deployment"("createdBy");
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");
CREATE INDEX "Deployment_environment_idx" ON "Deployment"("environment");

-- Agent Feedback indexes
CREATE INDEX "AgentFeedback_deploymentId_idx" ON "AgentFeedback"("deploymentId");
CREATE INDEX "AgentFeedback_userId_idx" ON "AgentFeedback"("userId");
CREATE INDEX "AgentFeedback_rating_idx" ON "AgentFeedback"("rating");

-- Review indexes
CREATE INDEX "Review_deploymentId_idx" ON "Review"("deploymentId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Review_agentId_idx" ON "Review"("agentId");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- Agent indexes
CREATE INDEX "Agent_createdBy_idx" ON "Agent"("createdBy");
CREATE INDEX "Agent_category_idx" ON "Agent"("category");
CREATE INDEX "Agent_status_idx" ON "Agent"("status");
CREATE INDEX "Agent_price_idx" ON "Agent"("price");

-- Web Embed indexes
CREATE INDEX "WebEmbed_createdBy_idx" ON "WebEmbed"("createdBy");
CREATE INDEX "WebEmbed_agentId_idx" ON "WebEmbed"("agentId");
CREATE INDEX "WebEmbed_status_idx" ON "WebEmbed"("status");

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deployment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Earning" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentMetrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebEmbed" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebEmbedLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentVersion" ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own profile" ON "User"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON "User"
    FOR UPDATE USING (auth.uid() = id);

-- Product policies
CREATE POLICY "Anyone can view public products" ON "Product"
    FOR SELECT USING ("isPublic" = true OR "createdBy" = auth.uid());

CREATE POLICY "Users can create products" ON "Product"
    FOR INSERT WITH CHECK (auth.uid() = "createdBy");

CREATE POLICY "Users can update their own products" ON "Product"
    FOR UPDATE USING (auth.uid() = "createdBy");

CREATE POLICY "Users can delete their own products" ON "Product"
    FOR DELETE USING (auth.uid() = "createdBy");

-- Agent policies
CREATE POLICY "Anyone can view public agents" ON "Agent"
    FOR SELECT USING ("isPublic" = true OR "createdBy" = auth.uid());

CREATE POLICY "Users can create agents" ON "Agent"
    FOR INSERT WITH CHECK (auth.uid() = "createdBy");

CREATE POLICY "Users can update their own agents" ON "Agent"
    FOR UPDATE USING (auth.uid() = "createdBy");

CREATE POLICY "Users can delete their own agents" ON "Agent"
    FOR DELETE USING (auth.uid() = "createdBy");

-- Deployment policies
CREATE POLICY "Anyone can view public deployments" ON "Deployment"
    FOR SELECT USING ("isPublic" = true OR "createdBy" = auth.uid() OR "deployedBy" = auth.uid());

CREATE POLICY "Users can create deployments" ON "Deployment"
    FOR INSERT WITH CHECK (auth.uid() = "createdBy" OR auth.uid() = "deployedBy");

CREATE POLICY "Users can update their own deployments" ON "Deployment"
    FOR UPDATE USING (auth.uid() = "createdBy" OR auth.uid() = "deployedBy");

-- Agent Feedback policies
CREATE POLICY "Users can view feedback on their deployments" ON "AgentFeedback"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Deployment" 
            WHERE "Deployment".id = "AgentFeedback"."deploymentId" 
            AND ("Deployment"."createdBy" = auth.uid() OR "Deployment"."deployedBy" = auth.uid())
        ) OR "userId" = auth.uid()
    );

CREATE POLICY "Users can create feedback" ON "AgentFeedback"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own feedback" ON "AgentFeedback"
    FOR UPDATE USING (auth.uid() = "userId");

-- Review policies
CREATE POLICY "Anyone can view reviews" ON "Review"
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON "Review"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own reviews" ON "Review"
    FOR UPDATE USING (auth.uid() = "userId");

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON "Notification"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can update their own notifications" ON "Notification"
    FOR UPDATE USING (auth.uid() = "userId");

-- Web Embed policies
CREATE POLICY "Anyone can view public embeds" ON "WebEmbed"
    FOR SELECT USING ("status" = 'active' OR "createdBy" = auth.uid());

CREATE POLICY "Users can create embeds" ON "WebEmbed"
    FOR INSERT WITH CHECK (auth.uid() = "createdBy");

CREATE POLICY "Users can update their own embeds" ON "WebEmbed"
    FOR UPDATE USING (auth.uid() = "createdBy");

-- Credit Transaction policies
CREATE POLICY "Users can view their own transactions" ON "CreditTransaction"
    FOR SELECT USING (auth.uid() = "userId");

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."User" (id, email, name, image)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updatedAt triggers to relevant tables
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deployment_updated_at BEFORE UPDATE ON "Deployment" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_feedback_updated_at BEFORE UPDATE ON "AgentFeedback" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_updated_at BEFORE UPDATE ON "Purchase" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_earning_updated_at BEFORE UPDATE ON "Earning" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_updated_at BEFORE UPDATE ON "Notification" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_updated_at BEFORE UPDATE ON "Agent" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_web_embed_updated_at BEFORE UPDATE ON "WebEmbed" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Note: Sample data will be created when users sign up through Supabase Auth
-- The handle_new_user() function will automatically create User records

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'AI Agency Website Supabase Database Setup Complete!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Database schema has been successfully created with:';
    RAISE NOTICE '- 15+ tables optimized for Supabase';
    RAISE NOTICE '- Row Level Security (RLS) policies for data protection';
    RAISE NOTICE '- Automatic user creation from Supabase Auth';
    RAISE NOTICE '- UUID primary keys for better performance';
    RAISE NOTICE '- Proper indexes for optimal query performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your SUPABASE_URL and SUPABASE_ANON_KEY in .env';
    RAISE NOTICE '2. Run: pnpm prisma generate';
    RAISE NOTICE '3. Run: pnpm dev';
    RAISE NOTICE '';
    RAISE NOTICE 'Your AI Agency Website is ready for Supabase!';
    RAISE NOTICE '=============================================================================';
END $$;
