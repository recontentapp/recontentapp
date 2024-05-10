import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ScheduleModule } from '@nestjs/schedule'
import { join } from 'path'
import { HealthModule } from 'src/modules/health/health.module'
import { MyLogger } from 'src/utils/logger'
import { LoggerMiddleware } from 'src/utils/logger.middleware'
import { RequestIdMiddleware } from 'src/utils/request-id.middleware'
import { PrismaService } from 'src/utils/prisma.service'
import { SQSService } from 'src/utils/sqs.service'
import { AuthModule } from 'src/modules/auth/auth.module'

import { PrivateApiController } from './private-api.controller'
import { PublicApiController } from './public-api.controller'
import { WebhooksController } from './webhooks.controller'
import { NotificationsModule } from 'src/modules/notifications/notifications.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { WorkspaceModule } from 'src/modules/workspace/workspace.module'
import { ProjectModule } from 'src/modules/project/project.module'
import { PhraseModule } from 'src/modules/phrase/phrase.module'
import getConfig from 'src/utils/config'
import { BillingModule } from 'src/modules/cloud/billing/billing.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfig],
    }),
    ThrottlerModule.forRoot([
      // 100 requests per 5 seconds
      {
        name: 'default',
        ttl: 5000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot({
      ignoreErrors: true,
    }),
    HealthModule,
    ...(process.env.SERVE_STATIC_FILES !== 'false'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', '..', '..', 'app', 'dist'),
            exclude: ['/private/(.*)', '/public/(.*)', '/webhooks/(.*)'],
          }),
        ]
      : []),
    AuthModule,
    NotificationsModule,
    WorkspaceModule,
    ProjectModule,
    PhraseModule,
    BillingModule,
  ],
  controllers: [PrivateApiController, PublicApiController, WebhooksController],
  providers: [
    MyLogger,
    SQSService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('private', 'public', 'webhooks')
    consumer.apply(LoggerMiddleware).forRoutes('private', 'public', 'webhooks')
  }
}
