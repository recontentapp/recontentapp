import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { RequestUser } from './types'

@Injectable()
export class APIKeyGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const authorizationHeader = request.headers['authorization']
    if (typeof authorizationHeader !== 'string') {
      throw new UnauthorizedException()
    }

    const matches = authorizationHeader.match(/(\S+)\s+(\S+)/)
    if (!matches || matches.length !== 3) {
      throw new UnauthorizedException()
    }

    const value = matches[2]
    const workspaceAccount =
      await this.prismaService.workspaceAccount.findFirst({
        where: { apiKey: value, blockedAt: null },
        include: {
          service: true,
          user: true,
          workspace: {
            include: {
              billingSettings: true,
            },
          },
        },
      })

    if (!workspaceAccount) {
      throw new UnauthorizedException()
    }

    if (workspaceAccount.service !== null) {
      const user: RequestUser = {
        type: 'service',
        account: workspaceAccount,
      }
      request.user = user
      return true
    }

    if (workspaceAccount.user) {
      const user: RequestUser = {
        type: 'scoped-human',
        account: workspaceAccount,
      }
      request.user = user
      return true
    }

    throw new UnauthorizedException()
  }
}
