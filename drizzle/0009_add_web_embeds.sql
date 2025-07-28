-- Create WebEmbedStatus enum
CREATE TYPE "WebEmbedStatus" AS ENUM ('active', 'inactive', 'pending', 'error');

-- Create WebEmbedType enum
CREATE TYPE "WebEmbedType" AS ENUM ('website', 'application', 'dashboard', 'tool', 'custom');

-- Create WebEmbed table
CREATE TABLE "WebEmbed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "type" "WebEmbedType" NOT NULL DEFAULT 'website',
    "status" "WebEmbedStatus" NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "width" TEXT NOT NULL DEFAULT '100%',
    "height" TEXT NOT NULL DEFAULT '600px',
    "allowFullscreen" BOOLEAN NOT NULL DEFAULT true,
    "allowScripts" BOOLEAN NOT NULL DEFAULT false,
    "sandbox" TEXT NOT NULL DEFAULT 'allow-same-origin allow-scripts allow-forms allow-popups',
    "agentId" TEXT,
    "agentConfig" JSONB,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requireAuth" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewed" TIMESTAMP(3),

    CONSTRAINT "WebEmbed_pkey" PRIMARY KEY ("id")
);

-- Create WebEmbedLog table
CREATE TABLE "WebEmbedLog" (
    "id" TEXT NOT NULL,
    "embedId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebEmbedLog_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "WebEmbed" ADD CONSTRAINT "WebEmbed_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WebEmbed" ADD CONSTRAINT "WebEmbed_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebEmbedLog" ADD CONSTRAINT "WebEmbedLog_embedId_fkey" FOREIGN KEY ("embedId") REFERENCES "WebEmbed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "WebEmbed_createdBy_idx" ON "WebEmbed"("createdBy");
CREATE INDEX "WebEmbed_agentId_idx" ON "WebEmbed"("agentId");
CREATE INDEX "WebEmbed_status_idx" ON "WebEmbed"("status");
CREATE INDEX "WebEmbedLog_embedId_idx" ON "WebEmbedLog"("embedId");
CREATE INDEX "WebEmbedLog_timestamp_idx" ON "WebEmbedLog"("timestamp");

-- Add Stripe fields to User table
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT; 