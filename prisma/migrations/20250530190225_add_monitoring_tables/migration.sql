-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "download_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AgentMetrics" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentMetrics_agentId_key" ON "AgentMetrics"("agentId");

-- CreateIndex
CREATE INDEX "AgentMetrics_agentId_idx" ON "AgentMetrics"("agentId");

-- CreateIndex
CREATE INDEX "AgentLog_agentId_idx" ON "AgentLog"("agentId");

-- CreateIndex
CREATE INDEX "AgentLog_level_idx" ON "AgentLog"("level");

-- CreateIndex
CREATE INDEX "AgentLog_timestamp_idx" ON "AgentLog"("timestamp");
