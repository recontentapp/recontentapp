import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { ProducerService } from 'src/modules/worker/producer.service'
import { Config } from 'src/utils/config'
import { MyLogger } from 'src/utils/logger'
import { PrismaService } from 'src/utils/prisma.service'

@Injectable()
export class ScheduleService {
  private active: boolean
  private readonly logger = new MyLogger()

  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly producerService: ProducerService,
    private readonly prismaService: PrismaService,
  ) {
    const distribution = this.configService.get('app.distribution', {
      infer: true,
    })
    this.active = distribution === 'cloud'
    if (!this.active) {
      return
    }
  }

  // `45 * * * * *` At 45 seconds of every minute
  // `0 4 * * *` Every day at 4:00 AM
  @Cron('0 4 * * *')
  async everyDay() {
    if (!this.active) {
      return
    }

    this.logger.log('Triggering daily AI usage reporting', {
      service: 'worker-producer',
    })

    const workspacesWhichShouldReportUsage =
      await this.prismaService.workspaceBillingSettings.findMany({
        where: {
          status: 'active',
          plan: {
            not: 'free',
          },
          stripeCustomerId: {
            not: null,
          },
          stripeSubscriptionId: {
            not: null,
          },
        },
        select: {
          workspaceId: true,
        },
      })

    for (const workspace of workspacesWhichShouldReportUsage) {
      this.producerService.sendMessage({
        type: 'ai-usage',
        workspaceId: workspace.workspaceId,
      })
    }
  }
}
