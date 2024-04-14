-- CreateEnum
CREATE TYPE "WorkspaceBillingPlan" AS ENUM ('free');

-- CreateTable
CREATE TABLE "workspace_billing_settings" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "stripeCustomerId" VARCHAR,
    "stripeSubscriptionId" VARCHAR,
    "plan" "WorkspaceBillingPlan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "workspace_billing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_settings_workspaceId_key" ON "workspace_billing_settings"("workspaceId");

-- AddForeignKey
ALTER TABLE "workspace_billing_settings" ADD CONSTRAINT "workspace_billing_settings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
