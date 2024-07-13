import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()

const getMeters = async (stripe: Stripe) => {
  const meters = await stripe.billing.meters.list({
    status: 'active',
  })

  const phrasesMeterId = meters.data.find(m => m.event_name === 'phrases')?.id
  const inputTokensMeterId = meters.data.find(
    m => m.event_name === 'input_tokens',
  )?.id
  const outputTokensMeterId = meters.data.find(
    m => m.event_name === 'output_tokens',
  )?.id

  if (!phrasesMeterId || !inputTokensMeterId || !outputTokensMeterId) {
    throw new Error('Meters not found')
  }

  return {
    phrasesMeterId,
    inputTokensMeterId,
    outputTokensMeterId,
  }
}

const upsertSubscriptionProduct = async (stripe: Stripe) => {
  const existingSubscriptionProduct = await stripe.products.search({
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"subscription"',
  })

  if (existingSubscriptionProduct.data.length === 1) {
    return existingSubscriptionProduct.data[0].id
  }

  const subscriptionProduct = await stripe.products.create({
    name: 'Pro - Subscription',
    metadata: {
      plan: 'pro',
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
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"subscription"',
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
    lookup_key: 'pro_subscription_monthly',
    recurring: {
      interval: 'month',
      interval_count: 1,
      usage_type: 'licensed',
    },
    metadata: {
      plan: 'pro',
      type: 'subscription',
    },
  })

  return subscriptionPrice.id
}

const upsertPhrasesUsageProduct = async (stripe: Stripe) => {
  const existingPhrasesUsageProduct = await stripe.products.search({
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"phrases_usage"',
  })

  if (existingPhrasesUsageProduct.data.length === 1) {
    return existingPhrasesUsageProduct.data[0].id
  }

  const phrasesUsageProduct = await stripe.products.create({
    name: 'Pro - Phrases usage',
    unit_label: 'phrase',
    metadata: {
      plan: 'pro',
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
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"phrases_usage"',
  })

  if (existingPhrasesUsagePrice.data.length === 1) {
    return existingPhrasesUsagePrice.data[0].id
  }

  const phrasesUsagePrice = await stripe.prices.create({
    product: phrasesUsageProductId,
    nickname: 'Monthly Pro Phrases Usage',
    tax_behavior: 'exclusive',
    currency: 'USD',
    tiers_mode: 'graduated',
    billing_scheme: 'tiered',
    lookup_key: 'pro_phrases_usage_monthly',
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
      plan: 'pro',
      type: 'phrases_usage',
    },
  })

  return phrasesUsagePrice.id
}

const upsertInputTokensUsageProduct = async (stripe: Stripe) => {
  const existingInputTokensUsageProduct = await stripe.products.search({
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"input_tokens_usage"',
  })

  if (existingInputTokensUsageProduct.data.length === 1) {
    return existingInputTokensUsageProduct.data[0].id
  }

  const inputTokensUsageProduct = await stripe.products.create({
    name: 'Pro - Input tokens usage',
    unit_label: 'input token',
    metadata: {
      plan: 'pro',
      type: 'input_tokens_usage',
    },
  })

  return inputTokensUsageProduct.id
}

const upsertInputTokensUsagePrice = async (
  stripe: Stripe,
  inputTokensUsageProductId: string,
  meterId: string,
) => {
  const existingInputTokensUsagePrice = await stripe.prices.search({
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"input_tokens_usage"',
  })

  if (existingInputTokensUsagePrice.data.length === 1) {
    return existingInputTokensUsagePrice.data[0].id
  }

  const inputTokensUsagePrice = await stripe.prices.create({
    product: inputTokensUsageProductId,
    nickname: 'Monthly Pro Input tokens Usage',
    tax_behavior: 'exclusive',
    billing_scheme: 'tiered',
    tiers_mode: 'graduated',
    tiers: [
      { up_to: 500000, unit_amount_decimal: '0' },
      { up_to: 'inf', unit_amount_decimal: '0.00001' },
    ],
    currency: 'USD',
    lookup_key: 'pro_input_tokens_usage_monthly',
    recurring: {
      interval: 'month',
      interval_count: 1,
      usage_type: 'metered',
      meter: meterId,
    },
    metadata: {
      plan: 'pro',
      type: 'input_tokens_usage',
    },
  })

  return inputTokensUsagePrice.id
}

const upsertOutputTokensUsageProduct = async (stripe: Stripe) => {
  const existingOutputTokensUsageProduct = await stripe.products.search({
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"output_tokens_usage"',
  })

  if (existingOutputTokensUsageProduct.data.length === 1) {
    return existingOutputTokensUsageProduct.data[0].id
  }

  const outputTokensUsageProduct = await stripe.products.create({
    name: 'Pro - Output tokens usage',
    unit_label: 'output token',
    metadata: {
      plan: 'pro',
      type: 'output_tokens_usage',
    },
  })

  return outputTokensUsageProduct.id
}

const upsertOutputTokensUsagePrice = async (
  stripe: Stripe,
  outputTokensUsageProductId: string,
  meterId: string,
) => {
  const existingOutputTokensUsagePrice = await stripe.prices.search({
    query: 'metadata["plan"]:"pro" AND metadata["type"]:"output_tokens_usage"',
  })

  if (existingOutputTokensUsagePrice.data.length === 1) {
    return existingOutputTokensUsagePrice.data[0].id
  }

  const outputTokensUsagePrice = await stripe.prices.create({
    product: outputTokensUsageProductId,
    nickname: 'Monthly Pro Output tokens Usage',
    tax_behavior: 'exclusive',
    billing_scheme: 'tiered',
    tiers_mode: 'graduated',
    lookup_key: 'pro_output_tokens_usage_monthly',
    tiers: [
      { up_to: 500000, unit_amount_decimal: '0' },
      { up_to: 'inf', unit_amount_decimal: '0.00002' },
    ],
    currency: 'USD',
    recurring: {
      interval: 'month',
      interval_count: 1,
      usage_type: 'metered',
      meter: meterId,
    },
    metadata: {
      plan: 'pro',
      type: 'output_tokens_usage',
    },
  })

  return outputTokensUsagePrice.id
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

  const { phrasesMeterId, inputTokensMeterId, outputTokensMeterId } =
    await getMeters(stripe)

  const phrasesUsageProductId = await upsertPhrasesUsageProduct(stripe)
  await upsertPhrasesUsagePrice(stripe, phrasesUsageProductId, phrasesMeterId)

  const inputTokensProductId = await upsertInputTokensUsageProduct(stripe)
  await upsertInputTokensUsagePrice(
    stripe,
    inputTokensProductId,
    inputTokensMeterId,
  )

  const outputTokensProductId = await upsertOutputTokensUsageProduct(stripe)
  await upsertOutputTokensUsagePrice(
    stripe,
    outputTokensProductId,
    outputTokensMeterId,
  )
}

void run()
