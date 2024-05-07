import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WorkspaceBillingStatus } from '@prisma/client'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import Stripe from 'stripe'
import { PayingPlan, payingPlans } from './plan'
import { Requester } from '../auth/requester.object'

interface GetActiveSubscriptionParams {
  workspaceId: string
  requester: Requester
}

interface UnsubscribeParams {
  workspaceId: string
  requester: Requester
}

interface ResetParams {
  workspaceId: string
  requester: Requester
}

interface SubscribeParams {
  workspaceId: string
  plan: PayingPlan
  requester: Requester
}

interface ActiveSubscription {
  id: string
  status: WorkspaceBillingStatus
  plan: PayingPlan
  startDate: string
  endDate: string | null
  currentPeriod: {
    start: string
    end: string
  }
  cancellation: {
    plannedDate: string | null
    date: string | null
  } | null
}

interface SubscriptionMetadata extends Stripe.MetadataParam {
  plan: PayingPlan
  workspaceId: string
}

@Injectable()
export class SubscriptionService {
  private stripe: Stripe | null
  private static notAvailableMessage: string =
    'Billing is not available for self-hosted distribution'

  // https://docs.stripe.com/api/subscriptions/object#subscription_object-status
  private static parseSubscriptionStatus(
    status: Stripe.Subscription.Status,
  ): WorkspaceBillingStatus {
    if (['trialing', 'active'].includes(status)) {
      return 'active'
    }

    if (['incomplete', 'past_due'].includes(status)) {
      return 'payment_required'
    }

    return 'inactive'
  }

  private static parseSubscriptionMetadata(
    metadata: Stripe.MetadataParam,
  ): SubscriptionMetadata {
    if (
      !metadata.plan ||
      !payingPlans.map(String).includes(String(metadata.plan))
    ) {
      throw new BadRequestException('Invalid metadata')
    }

    return {
      plan: metadata.plan as PayingPlan,
      workspaceId: String(metadata.workspaceId),
    }
  }

  public static webhookSubscriptionEvents: Stripe.Event['type'][] = [
    'customer.subscription.created',
    'customer.subscription.deleted',
    'customer.subscription.paused',
    'customer.subscription.pending_update_applied',
    'customer.subscription.pending_update_expired',
    'customer.subscription.resumed',
    'customer.subscription.trial_will_end',
    'customer.subscription.updated',
  ]

  constructor(
    private readonly configService: ConfigService<Config, true>,
    private readonly prismaService: PrismaService,
  ) {
    const distribution = this.configService.get('app.distribution', {
      infer: true,
    })
    const stripeAPIKey = this.configService.get('billing.stripeKey', {
      infer: true,
    })
    if (!stripeAPIKey || distribution === 'self-hosted') {
      return
    }

    this.stripe = new Stripe(stripeAPIKey, {
      typescript: true,
      apiVersion: '2024-04-10',
    })
  }

  private async resolvePrices() {
    if (!this.stripe) {
      throw new BadRequestException(SubscriptionService.notAvailableMessage)
    }

    // TODO: Make dynamic once multiple plans are introduced
    const [subscriptionPrice, phrasesUsagePrice, autotranslationUsagePrice] =
      await Promise.all([
        this.stripe.prices.search({
          query: 'metadata["id"]:"pro_subscription_monthly_1"',
        }),
        this.stripe.prices.search({
          query: 'metadata["id"]:"pro_phrases_usage_monthly_1"',
        }),
        this.stripe.prices.search({
          query: 'metadata["id"]:"pro_autotranslation_usage_monthly_1"',
        }),
      ])

    if (
      subscriptionPrice.data.length === 0 ||
      phrasesUsagePrice.data.length === 0 ||
      autotranslationUsagePrice.data.length === 0
    ) {
      throw new BadRequestException('Prices not found')
    }

    const subscriptionId = subscriptionPrice.data[0].id
    const phrasesUsageId = phrasesUsagePrice.data[0].id
    const autotranslationUsageId = autotranslationUsagePrice.data[0].id

    return [
      { price: subscriptionId },
      { price: phrasesUsageId },
      { price: autotranslationUsageId },
    ]
  }

  async subscribe({ workspaceId, plan, requester }: SubscribeParams) {
    if (!this.stripe) {
      throw new BadRequestException(SubscriptionService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeCustomerId) {
      throw new BadRequestException('Billing is not yet set up')
    }

    const customer = await this.stripe.customers
      .retrieve(config.stripeCustomerId)
      .catch(() => null)

    if (!customer || customer.deleted) {
      throw new BadRequestException('Billing is not yet set up')
    }

    if (config.stripeSubscriptionId) {
      const subscription = await this.stripe.subscriptions.retrieve(
        config.stripeCustomerId,
      )
      const status = SubscriptionService.parseSubscriptionStatus(
        subscription.status,
      )
      if (status !== 'inactive') {
        throw new BadRequestException('Subscription is already active')
      }
    }

    if (!customer.invoice_settings.default_payment_method) {
      throw new BadRequestException('Default source needs to be set up first')
    }

    const priceItems = await this.resolvePrices()

    const metadata: SubscriptionMetadata = {
      plan,
      workspaceId,
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: config.stripeCustomerId,
      collection_method: 'charge_automatically',
      metadata,
      items: priceItems,
    })

    await this.prismaService.workspaceBillingSettings.update({
      where: {
        id: config.id,
      },
      data: {
        stripeSubscriptionId: subscription.id,
      },
    })
  }

  async unsubscribe({ workspaceId, requester }: UnsubscribeParams) {
    if (!this.stripe) {
      throw new BadRequestException(SubscriptionService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription')
    }

    await this.stripe.subscriptions.cancel(config.stripeSubscriptionId)
  }

  async reset({ workspaceId, requester }: ResetParams) {
    if (!this.stripe) {
      throw new BadRequestException(SubscriptionService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeCustomerId || !config.stripeSubscriptionId) {
      throw new BadRequestException('No billing set up')
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      config.stripeSubscriptionId,
    )

    const status = SubscriptionService.parseSubscriptionStatus(
      subscription.status,
    )
    if (status !== 'inactive') {
      throw new BadRequestException('Subscription is still active')
    }

    await this.prismaService.workspaceBillingSettings.update({
      where: {
        id: config.id,
      },
      data: {
        stripeSubscriptionId: null,
        plan: 'free',
        status: 'active',
      },
    })
  }

  async getActiveSubscription({
    workspaceId,
    requester,
  }: GetActiveSubscriptionParams): Promise<ActiveSubscription | null> {
    if (!this.stripe) {
      throw new BadRequestException(SubscriptionService.notAvailableMessage)
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('billing:manage')

    const config =
      await this.prismaService.workspaceBillingSettings.findUniqueOrThrow({
        where: {
          workspaceId,
        },
      })

    if (!config.stripeSubscriptionId) {
      return null
    }

    const stripeSubscription = await this.stripe.subscriptions
      .retrieve(config.stripeSubscriptionId)
      .catch(() => null)

    if (!stripeSubscription) {
      return null
    }

    return {
      id: stripeSubscription.id,
      status: SubscriptionService.parseSubscriptionStatus(
        stripeSubscription.status,
      ),
      plan: SubscriptionService.parseSubscriptionMetadata(
        stripeSubscription.metadata,
      ).plan,
      startDate: new Date(stripeSubscription.start_date * 1000).toISOString(),
      endDate: stripeSubscription.ended_at
        ? new Date(stripeSubscription.ended_at * 1000).toISOString()
        : null,
      currentPeriod: {
        start: new Date(
          stripeSubscription.current_period_start * 1000,
        ).toISOString(),
        end: new Date(
          stripeSubscription.current_period_end * 1000,
        ).toISOString(),
      },
      cancellation:
        stripeSubscription.canceled_at || stripeSubscription.cancel_at
          ? {
              plannedDate: stripeSubscription.cancel_at
                ? new Date(stripeSubscription.cancel_at).toISOString()
                : null,
              date: stripeSubscription.canceled_at
                ? new Date(stripeSubscription.canceled_at).toISOString()
                : null,
            }
          : null,
    }
  }

  async onWebhookSubscriptionChange(id: string) {
    if (!this.stripe) {
      throw new BadRequestException(SubscriptionService.notAvailableMessage)
    }

    const billingSettings =
      await this.prismaService.workspaceBillingSettings.findFirst({
        where: {
          stripeSubscriptionId: id,
        },
      })
    if (!billingSettings) {
      return
    }

    const subscription = await this.stripe.subscriptions.retrieve(id)
    if (!subscription) {
      throw new BadRequestException('Invalid subscription')
    }

    const metadata = SubscriptionService.parseSubscriptionMetadata(
      subscription.metadata,
    )
    const status = SubscriptionService.parseSubscriptionStatus(
      subscription.status,
    )

    await this.prismaService.workspaceBillingSettings.update({
      where: {
        id: billingSettings.id,
      },
      data: {
        status,
        plan: metadata.plan,
      },
    })
  }
}
