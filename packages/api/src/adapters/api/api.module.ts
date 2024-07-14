import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { join } from 'path'
import { AuthModule } from 'src/modules/auth/auth.module'
import { BillingModule } from 'src/modules/cloud/billing/billing.module'
import { GitHubAppModule } from 'src/modules/cloud/github-app/github-app.module'
import { SlackNotificationsModule } from 'src/modules/cloud/slack-notifications/slack-notifications.module'
import { FigmaModule } from 'src/modules/figma/figma.module'
import { HealthModule } from 'src/modules/health/health.module'
import { NotificationsModule } from 'src/modules/notifications/notifications.module'
import { PhraseModule } from 'src/modules/phrase/phrase.module'
import { ProjectModule } from 'src/modules/project/project.module'
import { UXWritingModule } from 'src/modules/ux-writing/ux-writing.module'
import { WorkerModule } from 'src/modules/worker/worker.module'
import { WorkspaceModule } from 'src/modules/workspace/workspace.module'
import getConfig from 'src/utils/config'
import { MyLogger } from 'src/utils/logger'
import { LoggerMiddleware } from 'src/utils/logger.middleware'
import { PrismaService } from 'src/utils/prisma.service'
import { RequestIdMiddleware } from 'src/utils/request-id.middleware'
import { FigmaPluginController } from './controllers/figma-plugin.controller'
import { Private2ApiController } from './controllers/private-2.controller'
import { PrivateApiController } from './controllers/private.controller'
import { PublicApiController } from './controllers/public.controller'
import { WebhooksController } from './controllers/webhooks.controller'

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
            serveStaticOptions: {
              cacheControl: true,
              immutable: true,
              maxAge: 1000 * 60 * 60 * 24,
            },
            exclude: [
              '/private/(.*)',
              '/public/(.*)',
              '/webhooks/(.*)',
              '/figma-plugin/(.*)',
            ],
          }),
        ]
      : []),
    AuthModule,
    UXWritingModule,
    WorkerModule,
    SlackNotificationsModule,
    GitHubAppModule,
    NotificationsModule,
    WorkspaceModule,
    ProjectModule,
    PhraseModule,
    BillingModule,
    FigmaModule,
  ],
  controllers: [
    PrivateApiController,
    Private2ApiController,
    PublicApiController,
    WebhooksController,
    FigmaPluginController,
  ],
  providers: [
    MyLogger,
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
      .forRoutes('private', 'public', 'webhooks', 'figma-plugin')
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('private', 'public', 'webhooks', 'figma-plugin')
  }
}
