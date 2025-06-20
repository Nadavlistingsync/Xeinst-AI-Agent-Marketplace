-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "price" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "Deployment_createdBy_idx" ON "Deployment"("createdBy");

-- CreateIndex
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");
