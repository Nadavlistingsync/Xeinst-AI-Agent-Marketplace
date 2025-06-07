/*
  Warnings:

  - You are about to alter the column `sentimentScore` on the `AgentFeedback` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `earningsSplit` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "AgentFeedback" ALTER COLUMN "sentimentScore" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "AgentMetrics" ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "health" JSONB DEFAULT '{}',
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0.0';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "earningsSplit" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
