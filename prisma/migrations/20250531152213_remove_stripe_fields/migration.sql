/*
  Warnings:

  - You are about to drop the column `stripe_payment_intent_id` on the `purchases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "stripe_payment_intent_id";
