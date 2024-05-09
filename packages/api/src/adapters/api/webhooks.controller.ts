import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common'
import { Request } from 'express'
import stripe, { Stripe } from 'stripe'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { SubscriptionService } from 'src/modules/cloud/billing/subscription.service'

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private static isStripeSubscriptionObject(
    object: Stripe.Event['data']['object'],
  ): object is Stripe.Subscription {
    return object.object === 'subscription'
  }

  private static isStripeInvoiceObject(
    object: Stripe.Event['data']['object'],
  ): object is Stripe.Invoice {
    return object.object === 'invoice'
  }

  private getValidStripeEventOrThrow(
    req: RawBodyRequest<Request>,
  ): stripe.Event {
    const webhookSigningSecret = this.configService.get(
      'billing.stripeWebhookSigningSecret',
      { infer: true },
    )

    const signature = req.headers['stripe-signature']
    const rawBody = req.rawBody

    if (!rawBody || !signature || !webhookSigningSecret) {
      throw new BadRequestException(
        'Invalid Stripe webhook request or configuration',
      )
    }

    try {
      return stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSigningSecret,
      )
    } catch (err) {
      throw new BadRequestException('Invalid Stripe webhook signature')
    }
  }

  @Post('/stripe')
  @HttpCode(204)
  async stripe(@Req() req: RawBodyRequest<Request>) {
    const event = this.getValidStripeEventOrThrow(req)

    if (SubscriptionService.webhookSubscriptionEvents.includes(event.type)) {
      if (!WebhooksController.isStripeSubscriptionObject(event.data.object)) {
        throw new BadRequestException('Invalid Stripe subscription object')
      }

      await this.subscriptionService.onWebhookSubscriptionChange(
        event.data.object.id,
      )
    }

    if (SubscriptionService.webhookInvoiceEvents.includes(event.type)) {
      if (!WebhooksController.isStripeInvoiceObject(event.data.object)) {
        throw new BadRequestException('Invalid Stripe invoice object')
      }

      const subscriptionId =
        typeof event.data.object.subscription === 'string'
          ? event.data.object.subscription
          : event.data.object.subscription?.id ?? null

      if (!subscriptionId) {
        throw new BadRequestException('Invalid Stripe invoice subscription')
      }

      await this.subscriptionService.onWebhookSubscriptionInvoiceUpcoming(
        subscriptionId,
      )
    }
  }
}
