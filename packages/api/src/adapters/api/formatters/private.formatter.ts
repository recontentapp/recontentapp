import {
  Destination,
  DestinationConfigAWSS3,
  DestinationConfigCDN,
  DestinationConfigGoogleCloudStorage,
  FigmaFile,
  GithubInstallation,
  Language,
  Phrase,
  PhraseTranslation,
  Project,
  ProjectRevision,
  Tag,
  User,
  Workspace,
  WorkspaceAccount,
} from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'

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
    project: Project & { languages: Language[]; revisions: ProjectRevision[] },
  ): Components.Schemas.Project {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      // TODO: How to enforce presence?
      masterRevisionId: project.revisions.find(r => r.isMaster)?.id ?? '',
      name: project.name,
      description: project.description,
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
}
