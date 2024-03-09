-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "encryptedPassword" VARCHAR,
    "confirmationCode" VARCHAR,
    "providerName" VARCHAR NOT NULL DEFAULT 'email',
    "providerId" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_providerName_providerId_key" ON "users"("providerName", "providerId");
