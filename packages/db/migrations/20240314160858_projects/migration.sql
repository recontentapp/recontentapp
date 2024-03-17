-- CreateEnum
CREATE TYPE "ProjectRevisionState" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "languages" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "locale" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_revisions" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "projectId" VARCHAR NOT NULL,
    "isMaster" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR NOT NULL,
    "state" "ProjectRevisionState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mergedAt" TIMESTAMP(3),
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,
    "mergedBy" VARCHAR,

    CONSTRAINT "project_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_projects_languages" (
    "A" VARCHAR NOT NULL,
    "B" VARCHAR NOT NULL
);

-- CreateIndex
CREATE INDEX "languages_workspaceId_idx" ON "languages"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "languages_workspaceId_locale_key" ON "languages"("workspaceId", "locale");

-- CreateIndex
CREATE INDEX "projects_workspaceId_idx" ON "projects"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_workspaceId_name_key" ON "projects"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "project_revisions_workspaceId_idx" ON "project_revisions"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "_projects_languages_AB_unique" ON "_projects_languages"("A", "B");

-- CreateIndex
CREATE INDEX "_projects_languages_B_index" ON "_projects_languages"("B");

-- CreateIndex
CREATE INDEX "workspace_accounts_workspaceId_idx" ON "workspace_accounts"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_invitations_workspaceId_idx" ON "workspace_invitations"("workspaceId");

-- AddForeignKey
ALTER TABLE "languages" ADD CONSTRAINT "languages_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projects_languages" ADD CONSTRAINT "_projects_languages_A_fkey" FOREIGN KEY ("A") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projects_languages" ADD CONSTRAINT "_projects_languages_B_fkey" FOREIGN KEY ("B") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
