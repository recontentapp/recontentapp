-- CreateTable
CREATE TABLE "phrases" (
    "id" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "revisionId" VARCHAR NOT NULL,
    "projectId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "phrases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrase_translations" (
    "id" VARCHAR NOT NULL,
    "languageId" VARCHAR NOT NULL,
    "revisionId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "phraseId" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "phrase_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phrases_workspaceId_idx" ON "phrases"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "phrases_key_revisionId_key" ON "phrases"("key", "revisionId");

-- CreateIndex
CREATE INDEX "phrase_translations_workspaceId_idx" ON "phrase_translations"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "phrase_translations_phraseId_languageId_revisionId_key" ON "phrase_translations"("phraseId", "languageId", "revisionId");

-- AddForeignKey
ALTER TABLE "phrases" ADD CONSTRAINT "phrases_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrases" ADD CONSTRAINT "phrases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrases" ADD CONSTRAINT "phrases_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "phrases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
