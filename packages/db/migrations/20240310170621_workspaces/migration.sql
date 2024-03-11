-- CreateEnum
CREATE TYPE "WorkspaceAccountRole" AS ENUM ('owner', 'biller', 'member', 'guest');

-- CreateEnum
CREATE TYPE "WorkspaceAccountType" AS ENUM ('human', 'service');

-- CreateTable
CREATE TABLE "services" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_accounts" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "type" "WorkspaceAccountType" NOT NULL,
    "role" "WorkspaceAccountRole" NOT NULL,
    "userId" VARCHAR,
    "serviceId" VARCHAR,
    "apiKey" VARCHAR,
    "invitedBy" VARCHAR,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invitations" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "role" "WorkspaceAccountRole" NOT NULL,
    "email" VARCHAR NOT NULL,
    "invitationCode" VARCHAR NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_key_key" ON "workspaces"("key");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_accounts_userId_workspaceId_key" ON "workspace_accounts"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_accounts_apiKey_key" ON "workspace_accounts"("apiKey");

-- AddForeignKey
ALTER TABLE "workspace_accounts" ADD CONSTRAINT "workspace_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_accounts" ADD CONSTRAINT "workspace_accounts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_accounts" ADD CONSTRAINT "workspace_accounts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
