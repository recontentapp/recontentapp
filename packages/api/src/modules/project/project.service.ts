import {
  BadRequestException,
  ImATeapotException,
  Injectable,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ProjectRevisionState } from '@prisma/client'
import { PrismaService } from 'src/utils/prisma.service'
import { ProjectCreatedEvent } from './events/project-created.event'
import { PaginationParams } from 'src/utils/pagination'
import { Requester } from '../auth/requester.object'

interface CreateProjectParams {
  workspaceId: string
  name: string
  description?: string
  languageIds: string[]
  requester: Requester
}

interface UpdateProjectParams {
  id: string
  name: string
  description?: string
  requester: Requester
}

interface AddLanguagesToProjectParams {
  projectId: string
  languageIds: string[]
  requester: Requester
}

interface DeleteProjectParams {
  projectId: string
  requester: Requester
}

interface GetProjectParams {
  projectId: string
  requester: Requester
}

interface GetProjectStatsParams {
  projectId: string
  requester: Requester
}

interface ListProjectsParams {
  workspaceId: string
  requester: Requester
  pagination: PaginationParams
}

interface ListProjectRevisionsParams {
  projectId: string
  state: ProjectRevisionState
  requester: Requester
  pagination: PaginationParams
}

interface GetProjectMasterRevisionParams {
  projectId: string
  requester: Requester
}

interface GetProjectRevisionParams {
  revisionId: string
  requester: Requester
}

@Injectable()
export class ProjectService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  private static defaultTags: Array<{
    key: string
    value: string
    color: string
    description: string
  }> = [
    {
      key: 'status',
      value: 'draft',
      color: '#e4e669',
      description: 'Improvements might be needed',
    },
    {
      key: 'status',
      value: 'review',
      color: '#0075ca',
      description: 'Needs to be verified',
    },
    {
      key: 'status',
      value: 'verified',
      color: '#04aa58',
      description: 'Ready to be used',
    },
  ]

  async getProject({ projectId, requester }: GetProjectParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        languages: true,
        revisions: {
          where: {
            isMaster: true,
          },
        },
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return project
  }

  async getProjectStats({ projectId, requester }: GetProjectStatsParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        languages: true,
        revisions: {
          where: {
            isMaster: true,
          },
        },
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const [phrasesCount, ...translationsCountByLanguage] = await Promise.all([
      this.prismaService.phrase.count({
        where: {
          revisionId: project.revisions[0].id,
        },
      }),
      ...project.languages.map(language =>
        this.prismaService.phraseTranslation.count({
          where: {
            revisionId: project.revisions[0].id,
            languageId: language.id,
          },
        }),
      ),
    ])

    const translations = project.languages.map((language, index) => {
      const translationsCount = translationsCountByLanguage[index]
      const percentage =
        phrasesCount > 0
          ? ((translationsCount / phrasesCount) * 100).toFixed(2)
          : '0'

      return {
        languageId: language.id,
        phrasesCount,
        translationsCount,
        percentage: `${percentage}%`,
      }
    })

    return {
      translations,
    }
  }

  async createProject({
    requester,
    workspaceId,
    name,
    description,
    languageIds,
  }: CreateProjectParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const { projectsCount } = workspaceAccess.getLimits()
    const existingProjectsCount = await this.prismaService.project.count({
      where: {
        workspaceId,
      },
    })
    if (existingProjectsCount + 1 > projectsCount) {
      throw new ImATeapotException(
        'Workspace has reached projects limit with current plan',
      )
    }

    if (languageIds.length > 0) {
      const languages = await this.prismaService.language.findMany({
        where: {
          workspaceId,
          id: { in: languageIds },
        },
      })

      if (languageIds.length !== languages.length) {
        throw new BadRequestException('Language ids are invalid')
      }
    }

    const project = await this.prismaService.$transaction(async t => {
      const project = await t.project.create({
        data: {
          workspaceId,
          name,
          description,
          createdBy: workspaceAccess.getAccountID(),
          languages: {
            connect: languageIds.map(id => ({
              id,
            })),
          },
        },
      })

      await t.projectRevision.create({
        data: {
          isMaster: true,
          name: 'master',
          state: ProjectRevisionState.open,
          createdBy: workspaceAccess.getAccountID(),
          projectId: project.id,
          workspaceId,
        },
      })

      await t.tag.createMany({
        data: ProjectService.defaultTags.map(
          ({ key, value, color, description }) => ({
            createdBy: workspaceAccess.getAccountID(),
            projectId: project.id,
            workspaceId,
            key,
            value,
            color,
            description,
          }),
        ),
      })

      return t.project.findFirstOrThrow({
        where: {
          id: project.id,
        },
        include: {
          languages: true,
          revisions: {
            where: {
              isMaster: true,
            },
          },
        },
      })
    })

    this.eventEmitter.emit(
      'project.created',
      new ProjectCreatedEvent(project.id),
    )

    return project
  }

  async updateProject({
    requester,
    id,
    name,
    description,
  }: UpdateProjectParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        languages: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    return this.prismaService.project.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        updatedBy: workspaceAccess.getAccountID(),
      },
      include: {
        revisions: {
          where: {
            isMaster: true,
          },
        },
        languages: true,
      },
    })
  }

  async addLanguagesToProject({
    projectId,
    languageIds,
    requester,
  }: AddLanguagesToProjectParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        languages: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    if (languageIds.length === 0) {
      throw new BadRequestException('Language ids are empty')
    }

    const languages = await this.prismaService.language.findMany({
      where: {
        workspaceId: project.workspaceId,
        id: { in: languageIds },
      },
    })

    if (languageIds.length !== languages.length) {
      throw new BadRequestException('Language ids are invalid')
    }

    const languageAlreadyLinked = project.languages
      .map(l => l.id)
      .some(id => languageIds.includes(id))

    if (languageAlreadyLinked) {
      throw new BadRequestException(
        'Some languages are already associated to project',
      )
    }

    await this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        languages: {
          connect: languageIds.map(id => ({
            id,
          })),
        },
      },
    })
  }

  async deleteProject({ projectId, requester }: DeleteProjectParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        languages: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const hasDestinations = await this.prismaService.destination.count({
      where: {
        revision: {
          projectId,
        },
      },
    })

    if (hasDestinations > 0) {
      throw new BadRequestException('Project has destinations')
    }

    await this.prismaService.$transaction(async t => {
      await t.figmaText.deleteMany({
        where: {
          phrase: {
            projectId,
          },
        },
      })
      await t.figmaFile.deleteMany({
        where: {
          projectId,
        },
      })
      await t.phraseTranslation.deleteMany({
        where: {
          phrase: {
            projectId,
          },
        },
      })
      await t.taggable.deleteMany({
        where: {
          phrase: {
            projectId,
          },
        },
      })
      await t.tag.deleteMany({
        where: {
          projectId,
        },
      })
      await t.phrase.deleteMany({
        where: {
          projectId,
        },
      })
      await t.projectRevision.deleteMany({
        where: {
          projectId,
        },
      })
      await t.project.delete({
        where: {
          id: projectId,
        },
      })
    })
  }

  async getProjectMasterRevision({
    projectId,
    requester,
  }: GetProjectMasterRevisionParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        revisions: {
          where: {
            isMaster: true,
          },
        },
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    if (project.revisions.length === 0) {
      throw new BadRequestException('Project has no master revision')
    }

    return project.revisions[0]
  }

  async listProjects({
    workspaceId,
    requester,
    pagination,
  }: ListProjectsParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { limit, offset, pageSize, page } = pagination
    const [projects, count] = await Promise.all([
      this.prismaService.project.findMany({
        where: {
          workspaceId,
        },
        include: {
          languages: true,
          revisions: {
            where: {
              isMaster: true,
            },
          },
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.project.count({
        where: {
          workspaceId,
        },
      }),
    ])

    return {
      items: projects,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async getProjectRevision({
    revisionId,
    requester,
  }: GetProjectRevisionParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: {
          id: revisionId,
        },
      },
    )

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return revision
  }

  async listProjectRevisions({
    projectId,
    requester,
    state,
    pagination,
  }: ListProjectRevisionsParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { limit, offset, pageSize, page } = pagination
    const [revisions, count] = await Promise.all([
      this.prismaService.projectRevision.findMany({
        where: {
          projectId,
          state,
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.projectRevision.count({
        where: {
          projectId,
        },
      }),
    ])

    return {
      items: revisions,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }
}
