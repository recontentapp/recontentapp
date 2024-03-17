import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { WorkspaceAccountRole } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import { PrismaService } from 'src/utils/prisma.service'
import { HumanRequester, Requester } from 'src/utils/requester'
import { WorkspaceInvitationCreatedEvent } from './events/invitation-created.event'
import { PaginationParams } from 'src/utils/pagination'
import { generateAPIKey } from 'src/utils/security'
import { LanguageLocale } from './locale'

interface CreateWorkspaceParams {
  key: string
  name: string
  requester: HumanRequester
}

interface ListUserWorkspacesParams {
  userId: string
}

interface GetWorkspaceParams {
  workspaceId: string
  requester: Requester
}

interface GetValidPendingWorkspaceInvitationByEmailParams {
  email: string
  workspaceId: string
}

interface InviteToWorkspaceParams {
  email: string
  workspaceId: string
  role: WorkspaceAccountRole
  requester: HumanRequester
}

interface JoinWorkspaceParams {
  invitationCode: string
  requester: HumanRequester
}

interface ListWorkspaceAccountsParams {
  pagination: PaginationParams
  requester: Requester
  type: 'human' | 'service' | 'all'
  workspaceId: string
}

interface CreateWorkspaceServiceAccountParams {
  workspaceId: string
  name: string
  role: WorkspaceAccountRole
  requester: HumanRequester
}

interface AddLanguagesToWorkspaceParams {
  workspaceId: string
  languages: Array<{
    name: string
    locale: LanguageLocale
  }>
  requester: HumanRequester
}

interface ListWorkspaceLanguagesParams {
  workspaceId: string
  requester: Requester
}

interface GetReferenceableAccountsParams {
  workspaceId: string
  requester: Requester
}

@Injectable()
export class WorkspaceService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async isWorkspaceKeyAvailable(key: string): Promise<boolean> {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { key },
    })
    return workspace === null
  }

  async createWorkspace({ key, name, requester }: CreateWorkspaceParams) {
    if (!this.isWorkspaceKeyAvailable(key)) {
      throw new BadRequestException('Workspace key is not available')
    }

    const workspace = await this.prismaService.$transaction(async t => {
      const workspace = await t.workspace.create({
        data: {
          key,
          name,
          createdBy: requester.userId,
        },
      })

      const account = await t.workspaceAccount.create({
        data: {
          type: 'human',
          workspaceId: workspace.id,
          role: 'owner',
          userId: requester.userId,
        },
      })

      await t.workspace.update({
        where: { id: workspace.id },
        data: {
          createdBy: account.id,
        },
      })

      return t.workspace.findUniqueOrThrow({
        where: { id: workspace.id },
      })
    })

    return workspace
  }

  async listWorkspaces({ userId }: ListUserWorkspacesParams) {
    const workspaces = await this.prismaService.workspace.findMany({
      where: {
        accounts: {
          some: {
            userId,
            type: 'human',
          },
        },
      },
    })

    return workspaces
  }

  async getWorkspace({ workspaceId, requester }: GetWorkspaceParams) {
    if (!requester.canAccessWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of workspace')
    }

    const workspace = await this.prismaService.workspace.findUniqueOrThrow({
      where: {
        id: workspaceId,
      },
    })

    return workspace
  }

  private generateInvitationToken(): string {
    return randomBytes(32).toString('hex')
  }

  private async getValidPendingWorkspaceInvitationByEmail(
    params: GetValidPendingWorkspaceInvitationByEmailParams,
  ) {
    return this.prismaService.workspaceInvitation.findFirst({
      where: {
        email: params.email,
        workspaceId: params.workspaceId,
        acceptedAt: null,
        expiredAt: {
          gt: new Date(),
        },
      },
    })
  }

  async inviteToWorkspace(params: InviteToWorkspaceParams) {
    if (!params.requester.canAdminWorkspace(params.workspaceId)) {
      throw new ForbiddenException('User is not an admin')
    }

    const existingInvitation =
      await this.getValidPendingWorkspaceInvitationByEmail({
        email: params.email,
        workspaceId: params.workspaceId,
      })
    if (existingInvitation) {
      throw new BadRequestException('Invitation already exists')
    }

    const invitation = await this.prismaService.workspaceInvitation.create({
      data: {
        email: params.email,
        role: params.role,
        invitationCode: this.generateInvitationToken(),
        createdBy: params.requester.getAccountIDForWorkspace(
          params.workspaceId,
        )!,
        expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        workspace: {
          connect: {
            id: params.workspaceId,
          },
        },
      },
    })

    this.eventEmitter.emit(
      'workspace.invitation.created',
      new WorkspaceInvitationCreatedEvent(invitation.id),
    )
  }

  async joinWorkspace({ invitationCode, requester }: JoinWorkspaceParams) {
    const invitation = await this.prismaService.workspaceInvitation.findFirst({
      where: {
        invitationCode,
        acceptedAt: null,
        expiredAt: {
          gt: new Date(),
        },
      },
    })

    if (!invitation) {
      throw new BadRequestException('Invalid invitation')
    }

    if (invitation.email !== requester.userEmail) {
      throw new ForbiddenException('User is not invited')
    }

    await this.prismaService.$transaction(async t => {
      await t.workspaceInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          acceptedAt: new Date(),
        },
      })

      await t.workspaceAccount.create({
        data: {
          type: 'human',
          userId: requester.userId,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
          invitedBy: invitation.createdBy,
        },
      })
    })
  }

  async listWorkspaceAccounts({
    workspaceId,
    type,
    requester,
    pagination,
  }: ListWorkspaceAccountsParams) {
    if (!requester.canAccessWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const { limit, offset, pageSize, page } = pagination
    const [accounts, count] = await Promise.all([
      this.prismaService.workspaceAccount.findMany({
        where: {
          workspaceId,
          ...(type === 'human'
            ? { userId: { not: null } }
            : type === 'service'
            ? { serviceId: { not: null } }
            : {}),
        },
        include: {
          user: true,
          service: true,
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.workspaceAccount.count({
        where: {
          workspaceId,
          ...(type === 'human'
            ? { userId: { not: null } }
            : type === 'service'
            ? { serviceId: { not: null } }
            : {}),
        },
      }),
    ])

    return {
      items: accounts.map(
        ({
          id,
          role,
          type,
          service,
          user,
          createdAt,
          updatedAt,
          invitedBy,
        }) => ({
          id,
          role,
          type,
          service: service
            ? {
                id: service.id,
                name: service.name,
              }
            : null,
          user: user
            ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              }
            : null,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
          invitedBy,
        }),
      ),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createWorkspaceServiceAccount({
    workspaceId,
    name,
    requester,
    role,
  }: CreateWorkspaceServiceAccountParams) {
    if (!requester.canAdminWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    await this.prismaService.$transaction(async t => {
      const service = await t.service.create({
        data: {
          name,
        },
      })

      await t.workspaceAccount.create({
        data: {
          type: 'service',
          workspaceId,
          apiKey: generateAPIKey(),
          serviceId: service.id,
          invitedBy: requester.getAccountIDForWorkspace(workspaceId)!,
          role,
        },
      })
    })
  }

  async addLanguagesToWorkspace({
    workspaceId,
    languages,
    requester,
  }: AddLanguagesToWorkspaceParams) {
    if (!requester.canAdminWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const existingLanguages = await this.prismaService.language.findMany({
      where: {
        workspaceId,
      },
    })

    const newLanguagesLocales = languages.map(l => l.locale)
    const existingLanguagesLocales = existingLanguages.map(
      l => l.locale as LanguageLocale,
    )
    const localeAlreadyUsed = existingLanguagesLocales.some(locale =>
      newLanguagesLocales.includes(locale),
    )

    if (localeAlreadyUsed) {
      throw new BadRequestException('Locale is already used in workspace')
    }

    await this.prismaService.language.createMany({
      data: languages.map(l => ({
        workspaceId,
        locale: l.locale,
        name: l.name,
        createdBy: requester.getAccountIDForWorkspace(workspaceId)!,
      })),
    })
  }

  async listWorkspaceLanguages({
    workspaceId,
    requester,
  }: ListWorkspaceLanguagesParams) {
    if (!requester.canAccessWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const languages = await this.prismaService.language.findMany({
      where: {
        workspaceId,
      },
    })

    return languages
  }

  async getReferenceableAccounts({
    requester,
    workspaceId,
  }: GetReferenceableAccountsParams) {
    if (!requester.canAccessWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const accounts = await this.prismaService.workspaceAccount.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    })

    return accounts.reduce<Record<string, string>>((acc, account) => {
      if (account.type === 'human') {
        acc[account.id] = `${account.user?.firstName} ${account.user?.lastName}`
      } else {
        acc[account.id] = `🤖 ${account.service?.name}`
      }

      return acc
    }, {})
  }
}
