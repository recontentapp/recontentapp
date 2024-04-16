import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { MyLogger } from './logger'
import { getRequestIdFromRequest } from './request-id.middleware'
import { getRequesterOrNull } from 'src/modules/auth/requester.resolver'

const REQUEST_PROCESSED = 'Request processed'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: MyLogger

  constructor() {
    this.logger = new MyLogger()
  }

  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now()

    res.on('close', () => {
      const method = req.method
      const path = req.baseUrl + req.path
      const queryParams =
        Object.keys(req.query).length > 0 ? req.query : undefined
      const ipAddress = req.ip
      const referer = req.headers.referer
      const requester = getRequesterOrNull(req)
      const statusCodeStartsWith = String(res.statusCode)[0]
      const service = path.startsWith('/public-api')
        ? 'public-api'
        : path.startsWith('/private-api')
          ? 'private-api'
          : 'worker'

      const params = {
        service,
        method,
        path,
        queryParams,
        ipAddress,
        referer,
        statusCode: res.statusCode,
        duration: Date.now() - now,
        requestId: getRequestIdFromRequest(req),
        ...requester?.getLoggingAttributes(),
      }

      switch (statusCodeStartsWith) {
        case '1':
        case '2':
        case '3':
          this.logger.log(REQUEST_PROCESSED, params)
          break
        case '4':
          this.logger.warn(REQUEST_PROCESSED, params)
          break
        case '5':
          this.logger.error(REQUEST_PROCESSED, params)
          break
      }
    })

    next()
  }
}
