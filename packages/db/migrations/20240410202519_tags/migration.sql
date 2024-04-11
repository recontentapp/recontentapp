-- CreateEnum
CREATE TYPE "TaggableType" AS ENUM ('phrase');

-- CreateTable
CREATE TABLE "tags" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "projectId" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taggables" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "tagId" VARCHAR NOT NULL,
    "recordId" VARCHAR NOT NULL,
    "recordType" "TaggableType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR NOT NULL,

    CONSTRAINT "taggables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_projectId_key_value_key" ON "tags"("projectId", "key", "value");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taggables" ADD CONSTRAINT "taggables_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "phrases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taggables" ADD CONSTRAINT "taggables_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
