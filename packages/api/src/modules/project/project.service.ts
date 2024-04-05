import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ProjectRevisionState } from '@prisma/client'
import { PrismaService } from 'src/utils/prisma.service'
import { HumanRequester } from 'src/utils/requester'
import { ProjectCreatedEvent } from './events/project-created.event'
import { PaginationParams } from 'src/utils/pagination'

interface CreateProjectParams {
  workspaceId: string
  name: string
  description?: string
  languageIds: string[]
  requester: HumanRequester
}

interface UpdateProjectParams {
  id: string
  name: string
  description?: string
  requester: HumanRequester
}

interface AddLanguagesToProjectParams {
  projectId: string
  languageIds: string[]
  requester: HumanRequester
}

interface DeleteProjectParams {
  projectId: string
  requester: HumanRequester
}

interface GetProjectParams {
  projectId: string
  requester: HumanRequester
}

interface ListProjectsParams {
  workspaceId: string
  requester: HumanRequester
  pagination: PaginationParams
}

interface ListProjectRevisionsParams {
  projectId: string
  state: ProjectRevisionState
  requester: HumanRequester
  pagination: PaginationParams
}

interface GetProjectMasterRevisionParams {
  projectId: string
  requester: HumanRequester
}

interface GetProjectRevisionParams {
  revisionId: string
  requester: HumanRequester
}

@Injectable()
export class ProjectService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

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

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    return project
  }

  async createProject({
    requester,
    workspaceId,
    name,
    description,
    languageIds,
  }: CreateProjectParams) {
    if (!requester.canAdminWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
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
          createdBy: requester.getAccountIDForWorkspace(workspaceId)!,
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
          createdBy: requester.getAccountIDForWorkspace(workspaceId)!,
          projectId: project.id,
          workspaceId,
        },
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

    if (!requester.canAdminWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    return this.prismaService.project.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        updatedBy: requester.getAccountIDForWorkspace(project.workspaceId)!,
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

    if (!requester.canAdminWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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

    if (!requester.canAdminWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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
      await t.phraseTranslation.deleteMany({
        where: {
          phrase: {
            projectId,
          },
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

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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
    if (!requester.canAccessWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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
