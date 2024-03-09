-- AlterTable
ALTER TABLE "users" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordCode" VARCHAR,
ADD COLUMN     "resetPasswordSentAt" TIMESTAMP(3);
