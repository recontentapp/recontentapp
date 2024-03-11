import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { HealthModule } from 'src/modules/health/health.module'
import { MyLogger } from 'src/utils/logger'
import { LoggerMiddleware } from 'src/utils/logger.middleware'
import { RequestIdMiddleware } from 'src/utils/request-id.middleware'
import { PrismaService } from 'src/utils/prisma.service'
import { AuthModule } from 'src/modules/auth/auth.module'

import { ApiController } from './private-api.controller'
import { PublicApiController } from './public-api.controller'
import { NotificationsModule } from 'src/modules/notifications/notifications.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { WorkspaceModule } from 'src/modules/workspace/workspace.module'

@Module({
  imports: [
    ThrottlerModule.forRoot([
      // 100 requests per 5 seconds
      {
        name: 'default',
        ttl: 5000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      ignoreErrors: true,
    }),
    HealthModule,
    ...(process.env.SERVE_STATIC_FILES === 'true'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'app', 'dist'),
            exclude: ['/private-api/(.*)', '/public-api/(.*)'],
          }),
        ]
      : []),
    AuthModule,
    NotificationsModule,
    WorkspaceModule,
  ],
  controllers: [ApiController, PublicApiController],
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
    consumer.apply(RequestIdMiddleware).forRoutes('private-api', 'public-api')
    consumer.apply(LoggerMiddleware).forRoutes('private-api', 'public-api')
  }
}
