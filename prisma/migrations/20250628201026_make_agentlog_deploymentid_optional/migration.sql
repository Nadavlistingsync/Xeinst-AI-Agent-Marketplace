-- DropForeignKey
ALTER TABLE "AgentLog" DROP CONSTRAINT "AgentLog_deploymentId_fkey";

-- AlterTable
ALTER TABLE "AgentLog" ALTER COLUMN "deploymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
