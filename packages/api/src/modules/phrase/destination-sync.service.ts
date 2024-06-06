import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { Cron } from '@nestjs/schedule'
import { ProducerService } from '../worker/producer.service'

@Injectable()
export class DestinationSyncService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config, true>,
    private readonly producerService: ProducerService,
  ) {}

  // `45 * * * * *` At 45 seconds of every minute
  // `0 4 * * *` Every day at 4:00 AM
  @Cron('0 5 * * *')
  async everyDay() {
    const workerConfig = this.configService.get('worker', { infer: true })
    if (!workerConfig.available) {
      return
    }

    const destinationsToSyncDaily =
      await this.prismaService.destination.findMany({
        where: {
          syncFrequency: 'daily',
          active: true,
        },
        select: {
          id: true,
          workspaceId: true,
        },
      })

    for (const destination of destinationsToSyncDaily) {
      this.producerService.sendMessage({
        type: 'destination-sync-request',
        destinationId: destination.id,
        workspaceId: destination.workspaceId,
      })
    }

    const todayIsMonday = new Date().getDay() === 1
    if (!todayIsMonday) {
      return
    }

    const destinationsToSyncWeekly =
      await this.prismaService.destination.findMany({
        where: {
          syncFrequency: 'weekly',
          active: true,
        },
        select: {
          id: true,
          workspaceId: true,
        },
      })

    for (const destination of destinationsToSyncWeekly) {
      this.producerService.sendMessage({
        type: 'destination-sync-request',
        destinationId: destination.id,
        workspaceId: destination.workspaceId,
      })
    }
  }
}
