import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { ProducerService } from 'src/modules/worker/producer.service'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class ScheduleService {
  private active: boolean

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
        type: 'autotranslation-usage',
        workspaceId: workspace.workspaceId,
      })
    }
  }
}
