-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('cdn', 'aws_s3', 'google_cloud_storage');

-- CreateTable
CREATE TABLE "destinations" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "revisionId" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "type" "DestinationType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncError" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSuccessfulSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_configs_cdn" (
    "id" VARCHAR NOT NULL,
    "destinationId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "fileFormat" VARCHAR NOT NULL,
    "includeEmptyTranslations" BOOLEAN NOT NULL DEFAULT false,
    "urls" TEXT[],

    CONSTRAINT "destination_configs_cdn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_configs_google_cloud_storage" (
    "id" VARCHAR NOT NULL,
    "destinationId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "fileFormat" VARCHAR NOT NULL,
    "includeEmptyTranslations" BOOLEAN NOT NULL DEFAULT false,
    "objectsPrefix" VARCHAR,
    "googleCloudProjectId" VARCHAR NOT NULL,
    "googleCloudBucketId" VARCHAR NOT NULL,
    "googleCloudServiceAccountKey" TEXT NOT NULL,

    CONSTRAINT "destination_configs_google_cloud_storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_configs_aws_s3" (
    "id" VARCHAR NOT NULL,
    "destinationId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "fileFormat" VARCHAR NOT NULL,
    "includeEmptyTranslations" BOOLEAN NOT NULL DEFAULT false,
    "objectsPrefix" VARCHAR,
    "awsBucketId" VARCHAR NOT NULL,
    "awsRegion" VARCHAR NOT NULL,
    "awsAccessKeyId" TEXT NOT NULL,
    "awsSecretAccessKey" TEXT NOT NULL,

    CONSTRAINT "destination_configs_aws_s3_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destination_configs_cdn_destinationId_key" ON "destination_configs_cdn"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "destination_configs_google_cloud_storage_destinationId_key" ON "destination_configs_google_cloud_storage"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "destination_configs_aws_s3_destinationId_key" ON "destination_configs_aws_s3"("destinationId");

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_cdn" ADD CONSTRAINT "destination_configs_cdn_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_cdn" ADD CONSTRAINT "destination_configs_cdn_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_google_cloud_storage" ADD CONSTRAINT "destination_configs_google_cloud_storage_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_google_cloud_storage" ADD CONSTRAINT "destination_configs_google_cloud_storage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_aws_s3" ADD CONSTRAINT "destination_configs_aws_s3_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_configs_aws_s3" ADD CONSTRAINT "destination_configs_aws_s3_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
