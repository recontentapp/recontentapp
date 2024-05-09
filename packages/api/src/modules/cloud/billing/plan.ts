import { Components } from 'src/generated/typeDefinitions'

export type PayingPlan = Exclude<
  Components.Schemas.WorkspaceBillingPlan,
  'free'
>

export const allPlans: Components.Schemas.WorkspaceBillingPlan[] = [
  'free',
  'pro',
]
export const payingPlans: PayingPlan[] = ['pro']

// https://docs.stripe.com/api/subscriptions/object#subscription_object-status
export type SubscriptionStatus =
  // `active` | `trialing`
  | 'active'
  // `canceled` | `unpaid` | `incomplete_expired` | `paused`
  | 'inactive'
  // `incomplete` | `past_due`
  | 'payment_required'

export const isValidPlan = (
  plan: string,
): plan is Components.Schemas.WorkspaceBillingPlan => {
  return allPlans.map(String).includes(plan)
}
