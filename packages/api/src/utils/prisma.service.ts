import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { MyLogger } from './logger'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnApplicationShutdown
{
  constructor() {
    super({
      log:
        process.env.DATABASE_LOG_QUERIES === 'true'
          ? [
              {
                emit: 'event',
                level: 'query',
              },
            ]
          : [],
    })

    const logger = new MyLogger()

    this.$on('query', ({ query, params, duration }) => {
      logger.log('Database query', {
        service: 'database',
        query,
        params,
        duration,
      })
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onApplicationShutdown() {
    await this.$disconnect()
  }
}
