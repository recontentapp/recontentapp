-- DropIndex
DROP INDEX "languages_workspaceId_idx";

-- DropIndex
DROP INDEX "phrase_translations_workspaceId_idx";

-- DropIndex
DROP INDEX "phrases_workspaceId_idx";

-- DropIndex
DROP INDEX "project_revisions_workspaceId_idx";

-- DropIndex
DROP INDEX "projects_workspaceId_idx";

-- DropIndex
DROP INDEX "workspace_accounts_workspaceId_idx";

-- DropIndex
DROP INDEX "workspace_invitations_workspaceId_idx";

-- AlterTable
ALTER TABLE "workspace_accounts" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedBy" VARCHAR;
