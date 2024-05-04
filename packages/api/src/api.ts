import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as bodyParser from 'body-parser'
import helmet from 'helmet'

import { ApiModule } from './adapters/api/api.module'
import { MyLogger } from './utils/logger'
import { PrismaExceptionFilter } from './utils/prisma-exception.filter'

const BODY_PARSER_LIMIT = '10MB'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    logger: new MyLogger(),
  })
  app.disable('x-powered-by')
  if (process.env.TRUST_PROXY === 'true') {
    app.enable('trust proxy')
  }
  app.enableCors({
    maxAge: 600,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
  app.use(helmet())
  app.use(bodyParser.json({ limit: BODY_PARSER_LIMIT }))
  app.use(
    bodyParser.urlencoded({
      limit: BODY_PARSER_LIMIT,
      extended: true,
    }),
  )
  app.useGlobalPipes(
    new ValidationPipe({ disableErrorMessages: true, transform: true }),
  )
  app.useGlobalFilters(new PrismaExceptionFilter())
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
