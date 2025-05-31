/*
  Warnings:

  - You are about to drop the column `subscriptionTier` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "subscriptionTier",
ADD COLUMN     "subscription_tier" TEXT NOT NULL DEFAULT 'free';
