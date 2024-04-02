-- CreateEnum
CREATE TYPE "WorkspaceAccountRole" AS ENUM ('owner', 'biller', 'member', 'guest');

-- CreateEnum
CREATE TYPE "WorkspaceAccountType" AS ENUM ('human', 'service');

-- CreateEnum
CREATE TYPE "ProjectRevisionState" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "encryptedPassword" VARCHAR,
    "providerName" VARCHAR NOT NULL DEFAULT 'email',
    "providerId" VARCHAR NOT NULL,
    "confirmationCode" VARCHAR,
    "resetPasswordCode" VARCHAR,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blockedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "resetPasswordSentAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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
    "blockedBy" VARCHAR,
    "blockedAt" TIMESTAMP(3),
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

-- CreateTable
CREATE TABLE "_projects_languages" (
    "A" VARCHAR NOT NULL,
    "B" VARCHAR NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_providerName_providerId_key" ON "users"("providerName", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_key_key" ON "workspaces"("key");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_accounts_userId_workspaceId_key" ON "workspace_accounts"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_accounts_apiKey_key" ON "workspace_accounts"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "languages_workspaceId_locale_key" ON "languages"("workspaceId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "projects_workspaceId_name_key" ON "projects"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "phrases_key_revisionId_key" ON "phrases"("key", "revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "phrase_translations_phraseId_languageId_revisionId_key" ON "phrase_translations"("phraseId", "languageId", "revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "_projects_languages_AB_unique" ON "_projects_languages"("A", "B");

-- CreateIndex
CREATE INDEX "_projects_languages_B_index" ON "_projects_languages"("B");

-- AddForeignKey
ALTER TABLE "workspace_accounts" ADD CONSTRAINT "workspace_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_accounts" ADD CONSTRAINT "workspace_accounts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_accounts" ADD CONSTRAINT "workspace_accounts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "languages" ADD CONSTRAINT "languages_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "_projects_languages" ADD CONSTRAINT "_projects_languages_A_fkey" FOREIGN KEY ("A") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projects_languages" ADD CONSTRAINT "_projects_languages_B_fkey" FOREIGN KEY ("B") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
