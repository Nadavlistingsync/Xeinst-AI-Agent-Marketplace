-- Add connected accounts table for OAuth integrations
CREATE TABLE IF NOT EXISTS "connected_accounts" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "platformUserId" TEXT NOT NULL,
  "platformUserName" TEXT NOT NULL,
  "credentials" TEXT NOT NULL,
  "permissions" TEXT[] NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'connected',
  "lastUsed" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "connected_accounts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "connected_accounts_userId_idx" ON "connected_accounts"("userId");
CREATE INDEX IF NOT EXISTS "connected_accounts_agentId_idx" ON "connected_accounts"("agentId");
CREATE INDEX IF NOT EXISTS "connected_accounts_platform_idx" ON "connected_accounts"("platform");
CREATE INDEX IF NOT EXISTS "connected_accounts_status_idx" ON "connected_accounts"("status");

-- Add unique constraint to prevent duplicate connections
CREATE UNIQUE INDEX IF NOT EXISTS "connected_accounts_user_agent_platform_unique" ON "connected_accounts"("userId", "agentId", "platform");
