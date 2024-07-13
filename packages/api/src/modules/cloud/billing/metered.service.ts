import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import Stripe from 'stripe'

interface GetUsageForPeriodParams {
  startTime: Date
  endTime: Date
  workspaceId: string
}

interface ReportPhrasesUsageParams {
  workspaceId: string
}

interface ReportDailyAIUsageParams {
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
  private stripe: Stripe | null

  private static phrasesMeterEventName = 'phrases'
  private static inputTokensMeterEventName = 'input_tokens'
  private static outputTokensMeterEventName = 'output_tokens'
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
      return
    }

    const stripeAPIKey = this.configService.get('billing.stripeKey', {
      infer: true,
    })
    this.stripe = new Stripe(String(stripeAPIKey), {
      typescript: true,
      apiVersion: '2024-04-10',
    })
  }

  async getUsageForPeriod({
    startTime,
    endTime,
    workspaceId,
  }: GetUsageForPeriodParams) {
    if (!this.active) {
      throw new BadRequestException('Metered service is not configured')
    }

    const result = await this.prismaService.aIUsageEvent.aggregate({
      where: {
        workspaceId,
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
      },
      _sum: {
        inputTokensCount: true,
        outputTokensCount: true,
      },
    })

    return result._sum
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

  async reportDailyAIUsage({ workspaceId }: ReportDailyAIUsageParams) {
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
    })

    await this.stripe.billing.meterEvents
      .create({
        event_name: MeteredService.inputTokensMeterEventName,
        payload: {
          value: String(usage.inputTokensCount),
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

    await this.stripe.billing.meterEvents
      .create({
        event_name: MeteredService.outputTokensMeterEventName,
        payload: {
          value: String(usage.outputTokensCount),
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
        event_name: MeteredService.phrasesMeterEventName,
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
