-- CreateTable
CREATE TABLE "email_layouts" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "projectId" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "description" VARCHAR,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "email_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "projectId" VARCHAR NOT NULL,
    "layoutId" VARCHAR,
    "key" VARCHAR NOT NULL,
    "description" VARCHAR,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "updatedBy" VARCHAR,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_variables" (
    "id" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "layoutId" VARCHAR,
    "templateId" VARCHAR,
    "key" VARCHAR NOT NULL,
    "defaultContent" TEXT NOT NULL,

    CONSTRAINT "email_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_variable_translations" (
    "id" VARCHAR NOT NULL,
    "languageId" VARCHAR NOT NULL,
    "workspaceId" VARCHAR NOT NULL,
    "variableId" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "email_variable_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_layouts_projectId_key_key" ON "email_layouts"("projectId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_projectId_key_key" ON "email_templates"("projectId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "email_variables_layoutId_templateId_key_key" ON "email_variables"("layoutId", "templateId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "email_variable_translations_variableId_languageId_key" ON "email_variable_translations"("variableId", "languageId");

-- AddForeignKey
ALTER TABLE "email_layouts" ADD CONSTRAINT "email_layouts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_layouts" ADD CONSTRAINT "email_layouts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "email_layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_variables" ADD CONSTRAINT "email_variables_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_variables" ADD CONSTRAINT "email_variables_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "email_layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_variables" ADD CONSTRAINT "email_variables_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_variable_translations" ADD CONSTRAINT "email_variable_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_variable_translations" ADD CONSTRAINT "email_variable_translations_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "email_variables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_variable_translations" ADD CONSTRAINT "email_variable_translations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
