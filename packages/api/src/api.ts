import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as bodyParser from 'body-parser'

import { ApiModule } from './adapters/api/api.module'
import { MyLogger } from './utils/logger'
import { PrismaExceptionFilter } from './utils/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    cors: true,
    logger: new MyLogger(),
  })
  app.disable('x-powered-by')
  if (process.env.TRUST_PROXY === 'true') {
    app.enable('trust proxy')
  }
  app.use(bodyParser.json({ limit: '10MB' }))
  app.use(
    bodyParser.urlencoded({
      limit: '10MB',
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
