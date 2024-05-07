import { BeforeApplicationShutdown, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Consumer } from 'sqs-consumer'
import { Message as RawMessage } from '@aws-sdk/client-sqs'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { Message, SQSService } from 'src/utils/sqs.service'
import { MeteredService } from './metered.service'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class ScheduleService implements BeforeApplicationShutdown {
  private active: boolean
  private sqsConsumer: Consumer

  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly sqsService: SQSService,
    private readonly prismaService: PrismaService,
    private readonly meteredService: MeteredService,
  ) {
    this.active =
      this.configService.get('app.distribution', { infer: true }) === 'cloud'
    if (!this.active) {
      return
    }

    const queueUrl = this.configService.get('worker.sqsQueueUrl', {
      infer: true,
    })
    if (!queueUrl) {
      throw new Error('Worker SQS queue URL is not set')
    }

    this.sqsConsumer = Consumer.create({
      waitTimeSeconds: 20, // Long polling
      queueUrl,
      handleMessage: this.handleMessage.bind(this),
      sqs: this.sqsService.getClient(),
    })

    this.sqsConsumer.start()
  }

  private static isValidMessage(message: unknown): message is Message {
    return typeof message === 'object' && message !== null && 'type' in message
  }

  async beforeApplicationShutdown() {
    if (!this.active) {
      return
    }

    this.sqsConsumer.stop()
  }

  // `45 * * * * *` At 45 seconds of every minute
  // `0 4 * * *` Every day at 4:00 AM
  @Cron('0 4 * * *')
  async everyDay() {
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
      this.sqsService.sendMessage({
        type: 'autotranslation-usage',
        workspaceId: workspace.workspaceId,
      })
    }
  }

  async handleMessage(rawMessage: RawMessage) {
    if (!this.active) {
      return
    }

    const message = JSON.parse(rawMessage.Body ?? '{}')
    if (!ScheduleService.isValidMessage(message)) {
      console.error('Invalid message received', message)
      return
    }

    switch (message.type) {
      case 'autotranslation-usage': {
        await this.meteredService.reportDailyAutotranslationUsage({
          workspaceId: message.workspaceId,
        })
        break
      }

      case 'phrase-usage': {
        await this.meteredService.reportPhrasesUsage({
          workspaceId: message.workspaceId,
        })
        break
      }
    }
  }
}
