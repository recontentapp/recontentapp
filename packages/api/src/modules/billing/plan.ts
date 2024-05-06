export type Plan = 'free' | 'pro'
export type PayingPlan = Exclude<Plan, 'free'>

export const allPlans: Plan[] = ['free', 'pro']
export const payingPlans: PayingPlan[] = ['pro']

// https://docs.stripe.com/api/subscriptions/object#subscription_object-status
export type SubscriptionStatus =
  // `active` | `trialing`
  | 'active'
  // `canceled` | `unpaid` | `incomplete_expired` | `paused`
  | 'inactive'
  // `incomplete` | `past_due`
  | 'payment_required'

export const isValidPlan = (plan: string): plan is Plan => {
  return allPlans.map(String).includes(plan)
}
