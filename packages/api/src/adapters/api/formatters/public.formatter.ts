import {
  EmailTemplate,
  Language,
  Phrase,
  PhraseTranslation,
  Project,
  ProjectRevision,
  Workspace,
} from '@prisma/client'
import { Components } from 'src/generated/public/typeDefinitions'

export class PublicFormatter {
  static formatPhraseItem(phrase: Phrase): Components.Schemas.PhraseItem {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
    }
  }

  static formatPhrase(
    phrase: Phrase & { translations: PhraseTranslation[] },
  ): Components.Schemas.Phrase {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      translations: phrase.translations.map(t => ({
        id: t.id,
        languageId: t.languageId,
        content: t.content,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        createdBy: t.createdBy,
        updatedBy: t.updatedBy,
      })),
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
    }
  }

  static formatWorkspace(workspace: Workspace): Components.Schemas.Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      key: workspace.key,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    }
  }

  static formatLanguage(language: Language): Components.Schemas.Language {
    return {
      id: language.id,
      workspaceId: language.workspaceId,
      locale: language.locale,
      name: language.name,
      createdAt: language.createdAt.toISOString(),
      updatedAt: language.updatedAt.toISOString(),
    }
  }

  static formatProject(
    project: Project & { revisions: ProjectRevision[] },
  ): Components.Schemas.Project {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      masterRevisionId: project.revisions.find(r => r.isMaster)?.id ?? '',
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  }

  static formatEmailTemplate(
    template: EmailTemplate,
  ): Components.Schemas.EmailTemplate {
    return {
      id: template.id,
      projectId: template.projectId,
      workspaceId: template.workspaceId,
      key: template.key,
      description: template.description,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }
  }
}
