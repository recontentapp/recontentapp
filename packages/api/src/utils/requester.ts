import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common'
import { User as PrismaUser } from '@prisma/client'
import { Request } from 'express'

export type RequestUser =
  | {
      type: 'user'
      user: PrismaUser
    }
  | {
      type: 'service'
    }

interface UserRequester {
  type: 'user'
  userId: string
  userEmail: string
  canAccessWorkspace: (workspaceId: string) => boolean
  canAdminWorkspace: (workspaceId: string) => boolean
  getAccountIDForWorkspace: (workspaceId: string) => string | null
}

interface ServiceRequester {
  type: 'service'
  serviceAccountId: string
  canAccessWorkspace: (workspaceId: string) => boolean
  canAdminWorkspace: (workspaceId: string) => boolean
  getAccountIDForWorkspace: (workspaceId: string) => string | null
}

export type Requester = UserRequester | ServiceRequester

export const getRequesterOrNull = (req: Request): Requester | null => {
  const user = req.user as RequestUser | undefined

  if (!user) {
    return null
  }

  if (user.type === 'service') {
    // TODO: handle workspace service accounts
    return null
  }

  const requester: UserRequester = {
    type: 'user',
    userId: user.user.id,
    userEmail: user.user.email,
    canAccessWorkspace: () => {
      return false
    },
    canAdminWorkspace: () => {
      return false
    },
    getAccountIDForWorkspace: () => {
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
