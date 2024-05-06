/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `workspace_billing_settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `workspace_billing_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WorkspaceBillingStatus" AS ENUM ('active', 'inactive', 'payment_required');

-- AlterTable
ALTER TABLE "workspace_billing_settings" ADD COLUMN     "status" "WorkspaceBillingStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "plan" SET DEFAULT 'free';

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_settings_stripeCustomerId_key" ON "workspace_billing_settings"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_settings_stripeSubscriptionId_key" ON "workspace_billing_settings"("stripeSubscriptionId");
