import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common'
import { Request } from 'express'
import { getRequesterOrNull } from './requester.resolver'

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
