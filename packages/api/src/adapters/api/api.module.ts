import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { HealthModule } from 'src/modules/health/health.module'
import { MyLogger } from 'src/utils/logger'
import { LoggerMiddleware } from 'src/utils/logger.middleware'
import { RequestIdMiddleware } from 'src/utils/request-id.middleware'

import { ApiController } from './private-api.controller'
import { PublicApiController } from './public-api.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [ApiController, PublicApiController],
  providers: [MyLogger],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('private-api', 'public-api')
    consumer.apply(LoggerMiddleware).forRoutes('private-api', 'public-api')
  }
}
