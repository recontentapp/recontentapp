-- CreateEnum
CREATE TYPE "WorkspaceBillingStatus" AS ENUM ('active', 'inactive', 'payment_required');

-- AlterEnum
ALTER TYPE "WorkspaceBillingPlan" ADD VALUE 'pro';

-- AlterTable
ALTER TABLE "workspace_billing_settings" ADD COLUMN     "status" "WorkspaceBillingStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "plan" SET DEFAULT 'free';

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_settings_stripeCustomerId_key" ON "workspace_billing_settings"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_settings_stripeSubscriptionId_key" ON "workspace_billing_settings"("stripeSubscriptionId");
