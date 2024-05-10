-- CreateTable
CREATE TABLE "figma_files" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "projectId" VARCHAR NOT NULL,
    "revisionId" VARCHAR NOT NULL,
    "languageId" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "figma_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "figma_texts" (
    "id" VARCHAR NOT NULL,
    "fileId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "phraseId" VARCHAR NOT NULL,
    "textNodeId" VARCHAR NOT NULL,
    "pageNodeId" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "figma_texts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "figma_files_key_key" ON "figma_files"("key");

-- CreateIndex
CREATE INDEX "figma_texts_fileId_pageNodeId_idx" ON "figma_texts"("fileId", "pageNodeId");

-- AddForeignKey
ALTER TABLE "figma_files" ADD CONSTRAINT "figma_files_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "figma_files" ADD CONSTRAINT "figma_files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "figma_files" ADD CONSTRAINT "figma_files_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "figma_files" ADD CONSTRAINT "figma_files_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "figma_texts" ADD CONSTRAINT "figma_texts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "figma_texts" ADD CONSTRAINT "figma_texts_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "figma_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "figma_texts" ADD CONSTRAINT "figma_texts_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "phrases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
