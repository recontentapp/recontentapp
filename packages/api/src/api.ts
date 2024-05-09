import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'

import { ApiModule } from './adapters/api/api.module'
import { MyLogger } from './utils/logger'
import { PrismaExceptionFilter } from './utils/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    logger: new MyLogger(),
    bodyParser: true,
    // Used for webhook signature verification
    rawBody: true,
  })
  app.use(helmet())
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false,
    maxAge: 600,
  })
  app.disable('x-powered-by')
  if (process.env.TRUST_PROXY === 'true') {
    app.enable('trust proxy')
  }
  app.useGlobalPipes(
    new ValidationPipe({ disableErrorMessages: true, transform: true }),
  )
  app.useGlobalFilters(new PrismaExceptionFilter())
  app.enableShutdownHooks()

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
