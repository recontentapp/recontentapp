import dotenv from 'dotenv'
import { Plan } from 'src/modules/billing/plan'
import Stripe from 'stripe'

dotenv.config()

/**
 * Meters cannot be searched by metadata nor completely deleted.
 */
const upsertMeters = async (stripe: Stripe) => {
  const existingMeters = await stripe.billing.meters.list({ status: 'active' })

  let phrasesUsageMeterId: string | undefined = undefined
  let autotranslationUsageMeterId: string | undefined = undefined

  for (const meter of existingMeters.data) {
    if (meter.event_name === 'phrases_usage_1') {
      phrasesUsageMeterId = meter.id
    } else if (meter.event_name === 'autotranslation_usage_1') {
      autotranslationUsageMeterId = meter.id
    }
  }

  if (!phrasesUsageMeterId) {
    const meter = await stripe.billing.meters.create({
      display_name: 'Phrases usage v1',
      event_name: 'phrases_usage_1',
      default_aggregation: {
        formula: 'sum',
      },
    })

    phrasesUsageMeterId = meter.id
  }

  if (!autotranslationUsageMeterId) {
    const meter = await stripe.billing.meters.create({
      display_name: 'Autotranslation usage v1',
      event_name: 'autotranslation_usage_1',
      event_time_window: 'day',
      default_aggregation: {
        formula: 'sum',
      },
    })

    autotranslationUsageMeterId = meter.id
  }

  return { phrasesUsageMeterId, autotranslationUsageMeterId }
}

const upsertSubscriptionProduct = async (stripe: Stripe) => {
  const existingSubscriptionProduct = await stripe.products.search({
    query: 'metadata["id"]:"pro_subscription_1"',
  })

  if (existingSubscriptionProduct.data.length === 1) {
    return existingSubscriptionProduct.data[0].id
  }

  const subscriptionProduct = await stripe.products.create({
    name: 'Pro - Subscription',
    metadata: {
      id: 'pro_subscription_1',
      plan: 'pro' as Plan,
      type: 'subscription',
    },
  })

  return subscriptionProduct.id
}

const upsertSubscriptionPrice = async (
  stripe: Stripe,
  subscriptionProductId: string,
) => {
  const existingSubscriptionPrice = await stripe.prices.search({
    query: 'metadata["id"]:"pro_subscription_monthly_1"',
  })

  if (existingSubscriptionPrice.data.length === 1) {
    return existingSubscriptionPrice.data[0].id
  }

  const subscriptionPrice = await stripe.prices.create({
    product: subscriptionProductId,
    nickname: 'Monthly Pro Subscription',
    tax_behavior: 'exclusive',
    unit_amount: 4900,
    currency: 'USD',
    recurring: {
      interval: 'month',
      interval_count: 1,
      usage_type: 'licensed',
    },
    metadata: {
      id: 'pro_subscription_monthly_1',
      plan: 'pro' as Plan,
      type: 'subscription',
    },
  })

  return subscriptionPrice.id
}

const upsertPhrasesUsageProduct = async (stripe: Stripe) => {
  const existingPhrasesUsageProduct = await stripe.products.search({
    query: 'metadata["id"]:"pro_phrases_usage_1"',
  })

  if (existingPhrasesUsageProduct.data.length === 1) {
    return existingPhrasesUsageProduct.data[0].id
  }

  const phrasesUsageProduct = await stripe.products.create({
    name: 'Pro - Phrases usage',
    unit_label: 'phrase',
    metadata: {
      id: 'pro_phrases_usage_1',
      plan: 'pro' as Plan,
      type: 'phrases_usage',
    },
  })

  return phrasesUsageProduct.id
}

const upsertPhrasesUsagePrice = async (
  stripe: Stripe,
  phrasesUsageProductId: string,
  meterId: string,
) => {
  const existingPhrasesUsagePrice = await stripe.prices.search({
    query: 'metadata["id"]:"pro_phrases_usage_monthly_1"',
  })

  if (existingPhrasesUsagePrice.data.length === 1) {
    return existingPhrasesUsagePrice.data[0].id
  }

  const phrasesUsagePrice = await stripe.prices.create({
    product: phrasesUsageProductId,
    nickname: 'Pro Phrases Usage',
    tax_behavior: 'exclusive',
    currency: 'USD',
    tiers_mode: 'graduated',
    billing_scheme: 'tiered',
    tiers: [
      { up_to: 5000, unit_amount_decimal: '0' },
      { up_to: 'inf', unit_amount_decimal: '0.1' },
    ],
    recurring: {
      interval: 'month',
      interval_count: 1,
      usage_type: 'metered',
      meter: meterId,
    },
    metadata: {
      id: 'pro_phrases_usage_monthly_1',
      plan: 'pro' as Plan,
      type: 'phrases_usage',
    },
  })

  return phrasesUsagePrice.id
}

const upsertAutotranslationUsageProduct = async (stripe: Stripe) => {
  const existingAutotranslationUsageProduct = await stripe.products.search({
    query: 'metadata["id"]:"pro_autotranslation_usage_1"',
  })

  if (existingAutotranslationUsageProduct.data.length === 1) {
    return existingAutotranslationUsageProduct.data[0].id
  }

  const autotranslationUsageProduct = await stripe.products.create({
    name: 'Pro - Autotranslation usage',
    unit_label: 'token',
    metadata: {
      id: 'pro_autotranslation_usage_1',
      plan: 'pro' as Plan,
      type: 'autotranslation_usage',
    },
  })

  return autotranslationUsageProduct.id
}

const upsertAutotranslationUsagePrice = async (
  stripe: Stripe,
  autotranslationUsageProductId: string,
  meterId: string,
) => {
  const existingAutotranslationUsagePrice = await stripe.prices.search({
    query: 'metadata["id"]:"pro_autotranslation_usage_monthly_1"',
  })

  if (existingAutotranslationUsagePrice.data.length === 1) {
    return existingAutotranslationUsagePrice.data[0].id
  }

  const autotranslationUsagePrice = await stripe.prices.create({
    product: autotranslationUsageProductId,
    nickname: 'Pro Autotranslation Usage',
    tax_behavior: 'exclusive',
    billing_scheme: 'tiered',
    tiers_mode: 'graduated',
    tiers: [
      { up_to: 1000000, unit_amount_decimal: '0' },
      { up_to: 'inf', unit_amount_decimal: '0.0015' },
    ],
    currency: 'USD',
    recurring: {
      interval: 'month',
      interval_count: 1,
      usage_type: 'metered',
      meter: meterId,
    },
    metadata: {
      id: 'pro_autotranslation_usage_monthly_1',
      plan: 'pro' as Plan,
      type: 'autotranslation_usage',
    },
  })

  return autotranslationUsagePrice.id
}

const run = async () => {
  const apiKey = process.env.STRIPE_API_KEY

  if (!apiKey) {
    throw new Error('No Stripe API key found')
  }

  const stripe = new Stripe(apiKey, {
    typescript: true,
    apiVersion: '2024-04-10',
  })

  const subscriptionProductId = await upsertSubscriptionProduct(stripe)
  await upsertSubscriptionPrice(stripe, subscriptionProductId)

  const { autotranslationUsageMeterId, phrasesUsageMeterId } =
    await upsertMeters(stripe)

  const phrasesUsageProductId = await upsertPhrasesUsageProduct(stripe)
  await upsertPhrasesUsagePrice(
    stripe,
    phrasesUsageProductId,
    phrasesUsageMeterId,
  )

  const atUsageProductId = await upsertAutotranslationUsageProduct(stripe)
  await upsertAutotranslationUsagePrice(
    stripe,
    atUsageProductId,
    autotranslationUsageMeterId,
  )
}

void run()
