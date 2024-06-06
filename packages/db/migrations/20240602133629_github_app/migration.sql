-- CreateEnum
CREATE TYPE "DestinationSyncFrequency" AS ENUM ('manually', 'daily', 'weekly');

-- AlterEnum
ALTER TYPE "DestinationType" ADD VALUE 'github';

-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "syncFrequency" "DestinationSyncFrequency" NOT NULL DEFAULT 'manually';

-- CreateTable
CREATE TABLE "destination_configs_github" (
    "id" VARCHAR NOT NULL,
    "destinationId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "installationId" VARCHAR NOT NULL,
    "fileFormat" VARCHAR NOT NULL,
    "includeEmptyTranslations" BOOLEAN NOT NULL DEFAULT false,
    "repositoryOwner" VARCHAR NOT NULL,
    "repositoryName" VARCHAR NOT NULL,
    "baseBranchName" VARCHAR NOT NULL,
    "objectsPrefix" VARCHAR,

    CONSTRAINT "destination_configs_github_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_installations" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "githubId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "githubAccount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "github_installations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destination_configs_github_destinationId_key" ON "destination_configs_github"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "github_installations_githubId_key" ON "github_installations"("githubId");

-- AddForeignKey
ALTER TABLE "destination_configs_github" ADD CONSTRAINT "destination_configs_github_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "github_installations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_github" ADD CONSTRAINT "destination_configs_github_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_github" ADD CONSTRAINT "destination_configs_github_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
