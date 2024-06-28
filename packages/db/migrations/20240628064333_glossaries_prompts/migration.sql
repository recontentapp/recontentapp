-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "glossaryId" VARCHAR;

-- CreateTable
CREATE TABLE "prompts" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "glossaryId" VARCHAR,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "tone" VARCHAR,
    "length" VARCHAR,
    "customInstructions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glossaries" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "glossaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glossary_terms" (
    "id" VARCHAR NOT NULL,
    "glossaryId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "forbidden" BOOLEAN NOT NULL DEFAULT false,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "nonTranslatable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glossary_term_translations" (
    "id" VARCHAR NOT NULL,
    "languageId" VARCHAR NOT NULL,
    "termId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glossary_term_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_projects_prompts" (
    "A" VARCHAR NOT NULL,
    "B" VARCHAR NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "glossary_term_translations_termId_languageId_key" ON "glossary_term_translations"("termId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "_projects_prompts_AB_unique" ON "_projects_prompts"("A", "B");

-- CreateIndex
CREATE INDEX "_projects_prompts_B_index" ON "_projects_prompts"("B");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "glossaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glossaries" ADD CONSTRAINT "glossaries_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glossary_terms" ADD CONSTRAINT "glossary_terms_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "glossaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glossary_terms" ADD CONSTRAINT "glossary_terms_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glossary_term_translations" ADD CONSTRAINT "glossary_term_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glossary_term_translations" ADD CONSTRAINT "glossary_term_translations_termId_fkey" FOREIGN KEY ("termId") REFERENCES "glossary_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glossary_term_translations" ADD CONSTRAINT "glossary_term_translations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "glossaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projects_prompts" ADD CONSTRAINT "_projects_prompts_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projects_prompts" ADD CONSTRAINT "_projects_prompts_B_fkey" FOREIGN KEY ("B") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
