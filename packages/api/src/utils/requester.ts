import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common'
import {
  User as PrismaUser,
  WorkspaceAccount as PrismaWorkspaceAccount,
  Service as PrismaService,
  WorkspaceAccount,
} from '@prisma/client'
import { Request } from 'express'

export type RequestUser =
  | {
      type: 'human'
      user: PrismaUser & {
        accounts: PrismaWorkspaceAccount[]
      }
    }
  | {
      type: 'service'
      account: PrismaWorkspaceAccount & {
        service: PrismaService | null
      }
    }

export interface HumanRequester {
  type: 'human'
  userId: string
  userEmail: string
  canAccessWorkspace: (workspaceId: string) => boolean
  canAdminWorkspace: (workspaceId: string) => boolean
  getAccountForWorkspace: (workspaceId: string) => WorkspaceAccount | null
  getAccountIDForWorkspace: (workspaceId: string) => string | null
}

export interface ServiceRequester {
  type: 'service'
  serviceAccountId: string
  serviceWorkspaceId: string
  canAccessWorkspace: (workspaceId: string) => boolean
  canAdminWorkspace: (workspaceId: string) => boolean
  getAccountForWorkspace: (workspaceId: string) => WorkspaceAccount | null
  getAccountIDForWorkspace: (workspaceId: string) => string | null
}

export type Requester = HumanRequester | ServiceRequester

export const getRequesterOrNull = (req: Request): Requester | null => {
  const user = req.user as RequestUser | undefined

  if (!user) {
    return null
  }

  if (user.type === 'service') {
    const requester: ServiceRequester = {
      type: 'service',
      serviceAccountId: user.account.id,
      serviceWorkspaceId: user.account.workspaceId,
      canAccessWorkspace: workspaceId => {
        if (workspaceId === user.account.workspaceId) {
          return true
        }

        return false
      },
      canAdminWorkspace: workspaceId => {
        if (
          workspaceId === user.account.workspaceId &&
          ['owner', 'admin'].includes(user.account.role)
        ) {
          return true
        }

        return false
      },
      getAccountForWorkspace: workspaceId => {
        if (workspaceId === user.account.workspaceId) {
          return user.account
        }

        return null
      },
      getAccountIDForWorkspace: workspaceId => {
        if (workspaceId === user.account.workspaceId) {
          return user.account.id
        }

        return null
      },
    }

    return requester
  }

  const requester: HumanRequester = {
    type: 'human',
    userId: user.user.id,
    userEmail: user.user.email,
    canAccessWorkspace: workspaceId => {
      const account = user.user.accounts.find(
        account => account.workspaceId === workspaceId,
      )

      if (account) {
        return true
      }

      return false
    },
    canAdminWorkspace: workspaceId => {
      const account = user.user.accounts.find(
        account =>
          account.workspaceId === workspaceId &&
          ['admin', 'owner'].includes(account.role),
      )

      if (account) {
        return true
      }

      return false
    },
    getAccountForWorkspace: workspaceId => {
      const account = user.user.accounts.find(
        account => account.workspaceId === workspaceId,
      )

      return account ?? null
    },
    getAccountIDForWorkspace: workspaceId => {
      const account = user.user.accounts.find(
        account => account.workspaceId === workspaceId,
      )

      if (account) {
        return account.id
      }

      return null
    },
  }

  return requester
}

export const AuthenticatedRequester = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const requester = getRequesterOrNull(request)

    if (!requester) {
      throw new ForbiddenException('User is not authenticated')
    }

    return requester
  },
)
