/*
  Warnings:

  - The `status` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessLevel` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `licenseType` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `averageResponseTime` to the `AgentMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `averageTokensUsed` to the `AgentMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerRequest` to the `AgentMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestsPerMinute` to the `AgentMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `AgentMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ProductAccessLevel" AS ENUM ('public', 'private', 'restricted');

-- CreateEnum
CREATE TYPE "ProductLicenseType" AS ENUM ('free', 'commercial', 'enterprise');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'feedback_alert';

-- AlterTable
ALTER TABLE "AgentFeedback" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "AgentLog" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "AgentMetrics" ADD COLUMN     "averageResponseTime" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "averageTokensUsed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "costPerRequest" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "requestsPerMinute" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "uploadedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "uploadedBy" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'draft',
DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "ProductAccessLevel" NOT NULL DEFAULT 'public',
DROP COLUMN "licenseType",
ADD COLUMN     "licenseType" "ProductLicenseType" NOT NULL DEFAULT 'free';

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_deployedBy_fkey" FOREIGN KEY ("deployedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
