import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'

const REQUEST_ID_HEADER = 'X-Request-ID'

export const getRequestIdFromRequest = (req: Request) =>
  req.headers[REQUEST_ID_HEADER] as string | undefined

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuid()

    req.headers[REQUEST_ID_HEADER] = requestId
    res.setHeader(REQUEST_ID_HEADER, requestId)

    next()
  }
}
