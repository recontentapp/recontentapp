import {
  Destination,
  DestinationConfigAWSS3,
  DestinationConfigCDN,
  DestinationConfigGoogleCloudStorage,
  EmailLayout,
  EmailTemplate,
  EmailVariable,
  EmailVariableTranslation,
  FigmaFile,
  GithubInstallation,
  Glossary,
  GlossaryTerm,
  GlossaryTermTranslation,
  Language,
  Phrase,
  PhraseTranslation,
  Project,
  ProjectRevision,
  Prompt,
  Tag,
  User,
  Workspace,
  WorkspaceAccount,
} from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import {
  isValidPromptLength,
  isValidPromptTone,
} from 'src/modules/ux-writing/prompt'

export class PrivateFormatter {
  static formatTag(tag: Tag): Components.Schemas.Tag {
    return {
      id: tag.id,
      workspaceId: tag.workspaceId,
      projectId: tag.projectId,
      key: tag.key,
      value: tag.value,
      color: tag.color,
      description: tag.description,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
      createdBy: tag.createdBy,
      updatedBy: tag.updatedBy,
    }
  }

  static formatFigmaFile(file: FigmaFile): Components.Schemas.FigmaFile {
    return {
      id: file.id,
      workspaceId: file.workspaceId,
      projectId: file.projectId,
      revisionId: file.revisionId,
      languageId: file.languageId,
      key: file.key,
      url: file.url,
      name: file.name,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
      createdBy: file.createdBy,
      updatedBy: file.updatedBy,
    }
  }

  static formatPhraseItem(
    phrase: Phrase & {
      taggables: {
        tagId: string
      }[]
    },
  ): Components.Schemas.PhraseItem {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      tags: phrase.taggables.map(t => t.tagId),
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
      createdBy: phrase.createdBy,
      updatedBy: phrase.updatedBy,
    }
  }

  static formatPhrase(
    phrase: Phrase & {
      translations: PhraseTranslation[]
      taggables: {
        tagId: string
      }[]
    },
  ): Components.Schemas.Phrase {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      tags: phrase.taggables.map(t => t.tagId),
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
      createdBy: phrase.createdBy,
      updatedBy: phrase.updatedBy,
    }
  }

  static formatWorkspace(workspace: Workspace): Components.Schemas.Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      key: workspace.key,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
      createdBy: workspace.createdBy,
      updatedBy: workspace.updatedBy,
    }
  }

  static formatCurrentUser(
    user: User & {
      accounts: Array<
        WorkspaceAccount & {
          workspace: Workspace
        }
      >
    },
  ): Components.Schemas.CurrentUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      accounts: user.accounts.map(account => ({
        id: account.id,
        role: account.role,
        hasAPIKey: !!account.apiKey,
        workspace: PrivateFormatter.formatWorkspace(account.workspace),
      })),
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
      createdBy: language.createdBy,
      updatedBy: language.updatedBy,
    }
  }

  static formatProject(
    project: Project & {
      languages: Language[]
      revisions: ProjectRevision[]
      prompts: Pick<Prompt, 'id'>[]
    },
  ): Components.Schemas.Project {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      // TODO: How to enforce presence?
      masterRevisionId: project.revisions.find(r => r.isMaster)?.id ?? '',
      name: project.name,
      description: project.description,
      prompts: project.prompts.map(item => item.id),
      glossaryId: project.glossaryId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      createdBy: project.createdBy,
      updatedBy: project.updatedBy,
      languages: project.languages.map(PrivateFormatter.formatLanguage),
    }
  }

  static formatProjectRevision(
    revision: ProjectRevision,
  ): Components.Schemas.ProjectRevision {
    return {
      id: revision.id,
      projectId: revision.projectId,
      workspaceId: revision.workspaceId,
      isMaster: revision.isMaster,
      name: revision.name,
      state: revision.state,
      createdAt: revision.createdAt.toISOString(),
      updatedAt: revision.updatedAt.toISOString(),
      createdBy: revision.createdBy,
      updatedBy: revision.updatedBy,
    }
  }

  static formatGithubInstallation(
    installation: GithubInstallation,
  ): Components.Schemas.GithubInstallation {
    return {
      id: installation.id,
      workspaceId: installation.workspaceId,
      githubAccount: installation.githubAccount,
      githubId: installation.githubId,
      githubUrl: `https://github.com/organizations/${installation.githubAccount}/settings/installations/${installation.githubId}`,
      createdAt: installation.createdAt.toISOString(),
      updatedAt: installation.updatedAt.toISOString(),
      createdBy: installation.createdBy,
      updatedBy: installation.updatedBy,
    }
  }

  static formatDestinationItem(
    destination: Destination,
  ): Components.Schemas.DestinationItem {
    return {
      id: destination.id,
      workspaceId: destination.workspaceId,
      revisionId: destination.revisionId,
      name: destination.name,
      type: destination.type,
      syncFrequency: destination.syncFrequency,
      active: destination.active,
      lastSyncError: destination.lastSyncError,
      lastSyncAt: destination.lastSyncAt
        ? destination.lastSyncAt.toISOString()
        : null,
      lastSuccessfulSyncAt: destination.lastSuccessfulSyncAt
        ? destination.lastSuccessfulSyncAt.toISOString()
        : null,
      createdAt: destination.createdAt.toISOString(),
      updatedAt: destination.updatedAt.toISOString(),
      createdBy: destination.createdBy,
      updatedBy: destination.updatedBy,
    }
  }

  static formatDestination(
    destination: Destination & {
      configCDN: DestinationConfigCDN | null
      configGoogleCloudStorage: DestinationConfigGoogleCloudStorage | null
      configAWSS3: DestinationConfigAWSS3 | null
    },
  ): Components.Schemas.Destination {
    return {
      id: destination.id,
      workspaceId: destination.workspaceId,
      revisionId: destination.revisionId,
      name: destination.name,
      type: destination.type,
      syncFrequency: destination.syncFrequency,
      active: destination.active,
      configCDN: destination.configCDN
        ? {
            fileFormat: destination.configCDN
              .fileFormat as Components.Schemas.FileFormat,
            includeEmptyTranslations:
              destination.configCDN.includeEmptyTranslations,
            id: destination.configCDN.id,
            urls: destination.configCDN.urls,
          }
        : null,
      configGoogleCloudStorage: destination.configGoogleCloudStorage
        ? {
            fileFormat: destination.configGoogleCloudStorage
              .fileFormat as Components.Schemas.FileFormat,
            includeEmptyTranslations:
              destination.configGoogleCloudStorage.includeEmptyTranslations,
            id: destination.configGoogleCloudStorage.id,
            objectsPrefix: destination.configGoogleCloudStorage.objectsPrefix,
            bucketId: destination.configGoogleCloudStorage.googleCloudBucketId,
            projectId:
              destination.configGoogleCloudStorage.googleCloudProjectId,
          }
        : null,
      configAWSS3: destination.configAWSS3
        ? {
            fileFormat: destination.configAWSS3
              .fileFormat as Components.Schemas.FileFormat,
            includeEmptyTranslations:
              destination.configAWSS3.includeEmptyTranslations,
            id: destination.configAWSS3.id,
            objectsPrefix: destination.configAWSS3.objectsPrefix,
            bucketId: destination.configAWSS3.awsBucketId,
            region: destination.configAWSS3.awsRegion,
          }
        : null,
      lastSyncError: destination.lastSyncError,
      lastSyncAt: destination.lastSyncAt
        ? destination.lastSyncAt.toISOString()
        : null,
      lastSuccessfulSyncAt: destination.lastSuccessfulSyncAt
        ? destination.lastSuccessfulSyncAt.toISOString()
        : null,
      createdAt: destination.createdAt.toISOString(),
      updatedAt: destination.updatedAt.toISOString(),
      createdBy: destination.createdBy,
      updatedBy: destination.updatedBy,
    }
  }

  static formatGlossary(glossary: Glossary): Components.Schemas.Glossary {
    return {
      id: glossary.id,
      workspaceId: glossary.workspaceId,
      name: glossary.name,
      description: glossary.description,
      createdAt: glossary.createdAt.toISOString(),
      updatedAt: glossary.updatedAt.toISOString(),
      createdBy: glossary.createdBy,
      updatedBy: glossary.updatedBy,
    }
  }

  static formatGlossaryTerm(
    term: GlossaryTerm & { translations: GlossaryTermTranslation[] },
  ): Components.Schemas.GlossaryTerm {
    return {
      id: term.id,
      workspaceId: term.workspaceId,
      glossaryId: term.glossaryId,
      name: term.name,
      description: term.description,
      forbidden: term.forbidden,
      caseSensitive: term.caseSensitive,
      nonTranslatable: term.nonTranslatable,
      translations: term.translations.map(t => ({
        languageId: t.languageId,
        content: t.content,
      })),
      createdAt: term.createdAt.toISOString(),
      updatedAt: term.updatedAt.toISOString(),
      createdBy: term.createdBy,
      updatedBy: term.updatedBy,
    }
  }

  static formatPrompt(prompt: Prompt): Components.Schemas.Prompt {
    return {
      id: prompt.id,
      workspaceId: prompt.workspaceId,
      glossaryId: prompt.glossaryId,
      name: prompt.name,
      description: prompt.description,
      tone: prompt.tone && isValidPromptTone(prompt.tone) ? prompt.tone : null,
      length:
        prompt.length && isValidPromptLength(prompt.length)
          ? prompt.length
          : null,
      customInstructions: prompt.customInstructions,
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
      createdBy: prompt.createdBy,
      updatedBy: prompt.updatedBy,
    }
  }

  static formatEmailLayout(
    layout: EmailLayout,
  ): Components.Schemas.EmailLayout {
    return {
      id: layout.id,
      projectId: layout.projectId,
      key: layout.key,
      description: layout.description,
      content: layout.content,
      workspaceId: layout.workspaceId,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
      createdBy: layout.createdBy,
      updatedBy: layout.updatedBy,
    }
  }

  static formatEmailLayoutWithVariables(
    layout: EmailLayout & {
      variables: Array<
        EmailVariable & {
          translations: EmailVariableTranslation[]
        }
      >
    },
  ): Components.Schemas.EmailLayoutWithVariables {
    return {
      id: layout.id,
      projectId: layout.projectId,
      key: layout.key,
      description: layout.description,
      content: layout.content,
      workspaceId: layout.workspaceId,
      variables: layout.variables.map(variable => ({
        id: variable.id,
        key: variable.key,
        defaultContent: variable.defaultContent,
        translations: variable.translations.map(t => ({
          languageId: t.languageId,
          content: t.content,
        })),
      })),
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
      createdBy: layout.createdBy,
      updatedBy: layout.updatedBy,
    }
  }

  static formatEmailTemplate(
    template: EmailTemplate,
  ): Components.Schemas.EmailTemplate {
    return {
      id: template.id,
      projectId: template.projectId,
      layoutId: template.layoutId,
      key: template.key,
      description: template.description,
      content: template.content,
      workspaceId: template.workspaceId,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
    }
  }

  static formatEmailTemplateWithVariables(
    template: EmailTemplate & {
      variables: Array<
        EmailVariable & {
          translations: EmailVariableTranslation[]
        }
      >
    },
  ): Components.Schemas.EmailTemplateWithVariables {
    return {
      id: template.id,
      projectId: template.projectId,
      layoutId: template.layoutId,
      key: template.key,
      description: template.description,
      content: template.content,
      workspaceId: template.workspaceId,
      variables: template.variables.map(variable => ({
        id: variable.id,
        key: variable.key,
        defaultContent: variable.defaultContent,
        translations: variable.translations.map(t => ({
          languageId: t.languageId,
          content: t.content,
        })),
      })),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
    }
  }
}
