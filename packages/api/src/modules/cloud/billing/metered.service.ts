import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  PutLogEventsCommand,
  StartQueryCommand,
} from '@aws-sdk/client-cloudwatch-logs'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { backOff } from 'exponential-backoff'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import Stripe from 'stripe'

type Metric = 'token'

interface LogParams {
  workspaceId: string
  accountId: string
  externalId: string
  metric: Metric
  quantity: number
  timestamp: Date
}

interface GetUsageForPeriodParams {
  startTime: Date
  endTime: Date
  workspaceId: string
  metric: Metric
}

interface ReportPhrasesUsageParams {
  workspaceId: string
}

interface ReportDailyAutotranslationUsageParams {
  workspaceId: string
}

type BuildIdentifierParams =
  | {
      id: string
      start: Date
      end: Date
    }
  | {
      id: string
      date: Date
    }

@Injectable()
export class MeteredService {
  private active: boolean
  private groupName: string
  private streamName: string
  private logsClient: CloudWatchLogsClient
  private stripe: Stripe | null

  private static notAvailableMessage: string =
    'Billing is not available for self-hosted distribution'

  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly prismaService: PrismaService,
  ) {
    const distribution = this.configService.get('app.distribution', {
      infer: true,
    })

    this.active = distribution === 'cloud'

    if (!this.active) {
      this.stripe = null
      return
    }

    const stripeAPIKey = this.configService.get('billing.stripeKey', {
      infer: true,
    })
    this.stripe = new Stripe(String(stripeAPIKey), {
      typescript: true,
      apiVersion: '2024-04-10',
    })

    const {
      cloudWatchLogsGroupName: groupName,
      cloudWatchLogsStreamName: streamName,
    } = this.configService.get('billing', { infer: true })

    this.logsClient = new CloudWatchLogsClient()
    this.groupName = String(groupName)
    this.streamName = String(streamName)
  }

  async log({
    workspaceId,
    accountId,
    externalId,
    metric,
    quantity,
    timestamp,
  }: LogParams) {
    if (!this.active) {
      return
    }

    await this.logsClient.send(
      new PutLogEventsCommand({
        logGroupName: this.groupName,
        logStreamName: this.streamName,
        logEvents: [
          {
            timestamp: timestamp.getTime(),
            message: JSON.stringify({
              workspaceId,
              accountId,
              externalId,
              metric,
              quantity,
            }),
          },
        ],
      }),
    )
  }

  async getUsageForPeriod({
    startTime,
    endTime,
    workspaceId,
    metric,
  }: GetUsageForPeriodParams) {
    if (!this.active) {
      throw new BadRequestException('Metered service is not configured')
    }

    const queryResponse = await this.logsClient.send(
      new StartQueryCommand({
        logGroupName: this.groupName,
        startTime: startTime.getTime() / 1000,
        endTime: endTime.getTime() / 1000,
        queryString: `fields workspaceId, metric, quantity
          | filter workspaceId = "${workspaceId}"
          | filter metric = "${metric}"
          | stats sum(\`quantity\`) as total
        `,
      }),
    )

    const queryId = queryResponse.queryId
    if (!queryId) {
      throw new BadRequestException('Query failed')
    }

    const total = await backOff(
      async () => {
        const response = await this.logsClient.send(
          new GetQueryResultsCommand({
            queryId: queryId,
          }),
        )

        if (response.status !== 'Complete') {
          throw new Error('Query not complete')
        }

        const result = response.results?.at(0)
        if (!result) {
          throw new Error('No results')
        }

        const total = result.find(field => field.field === 'total')?.value
        if (!total) {
          throw new Error('No total')
        }

        return Number(total)
      },
      {
        delayFirstAttempt: true,
        jitter: 'none',
        startingDelay: 1000 * 2,
        numOfAttempts: 5,
      },
    ).catch(() => null)

    if (!total) {
      throw new BadRequestException('Query failed')
    }

    return total
  }

  private buildIdentifier(params: BuildIdentifierParams) {
    if ('date' in params) {
      return [params.id, params.date.toISOString().split('T')[0]].join('_')
    }

    return [
      params.id,
      params.start.toISOString().split('T')[0],
      params.end.toISOString().split('T')[0],
    ].join('_')
  }

  private getYesterdayUTCBounds() {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)

    const startTime = new Date(yesterday)
    const endTime = new Date(yesterday)
    endTime.setUTCHours(23, 59, 59, 999)

    return {
      startTime,
      endTime,
    }
  }

  async reportDailyAutotranslationUsage({
    workspaceId,
  }: ReportDailyAutotranslationUsageParams) {
    if (!this.stripe) {
      throw new BadRequestException(MeteredService.notAvailableMessage)
    }

    const billingSettings =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: { workspaceId },
      })

    if (
      !billingSettings.stripeCustomerId ||
      !billingSettings.stripeSubscriptionId ||
      billingSettings.status !== 'active' ||
      billingSettings.plan === 'free'
    ) {
      return
    }

    const { startTime, endTime } = this.getYesterdayUTCBounds()
    const usage = await this.getUsageForPeriod({
      startTime,
      endTime,
      workspaceId,
      metric: 'token',
    })

    await this.stripe.billing.meterEvents
      .create({
        event_name: 'autotranslation_usage_1',
        payload: {
          value: String(usage),
          stripe_customer_id: billingSettings.stripeCustomerId,
        },
        identifier: this.buildIdentifier({
          id: billingSettings.stripeSubscriptionId,
          start: startTime,
          end: endTime,
        }),
      })
      .catch(e => {
        // Ignore invalid request errors due to duplicate events
        if (e.type !== 'StripeInvalidRequestError') {
          throw e
        }
      })
  }

  async reportPhrasesUsage({ workspaceId }: ReportPhrasesUsageParams) {
    if (!this.stripe) {
      throw new BadRequestException(MeteredService.notAvailableMessage)
    }

    const billingSettings =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: { workspaceId },
      })

    if (
      !billingSettings.stripeCustomerId ||
      !billingSettings.stripeSubscriptionId ||
      billingSettings.plan === 'free' ||
      billingSettings.status !== 'active'
    ) {
      return
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      billingSettings.stripeSubscriptionId,
    )

    const phrasesCount = await this.prismaService.phrase.count({
      where: { workspaceId },
    })

    await this.stripe.billing.meterEvents
      .create({
        event_name: 'phrases_usage_1',
        payload: {
          value: String(phrasesCount),
          stripe_customer_id: billingSettings.stripeCustomerId,
        },
        identifier: this.buildIdentifier({
          id: billingSettings.stripeSubscriptionId,
          start: new Date(subscription.current_period_start * 1000),
          end: new Date(subscription.current_period_end * 1000),
        }),
      })
      .catch(e => {
        // Ignore invalid request errors due to duplicate events
        // https://docs.stripe.com/error-handling?lang=node
        if (e.type !== 'StripeInvalidRequestError') {
          throw e
        }
      })
  }
}
