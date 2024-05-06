import { Components } from '../generated/typeDefinitions'

export const workspaceBillingStatusVariations: Record<
  Components.Schemas.WorkspaceBillingStatus,
  'success' | 'danger'
> = {
  active: 'success',
  inactive: 'danger',
  payment_required: 'danger',
}

export const workspaceBillingStatusLabels: Record<
  Components.Schemas.WorkspaceBillingStatus,
  string
> = {
  active: 'Active',
  inactive: 'Inactive',
  payment_required: 'Payment Required',
}

export const proPlan = {
  name: 'Pro plan',
  description: 'For innovative teams focused on productivity.',
  features: [
    'Everything in Free plan',
    'Unlimited phrases & translations',
    'Autotranslate with AI',
    'Built-in CDN & custom destinations',
    'Figma plugin',
  ],
  currency: 'USD',
  subscriptionAmount: 4900,
}
