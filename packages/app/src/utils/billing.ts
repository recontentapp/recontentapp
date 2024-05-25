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

export const freePlan = {
  name: 'Free plan',
  description: 'To discover Recontent.app and its features.',
  features: [
    '1 project max.',
    '1 000 translations max.',
    'Import/Export',
    'Tags',
    'API & CLI for developers',
  ],
  currency: 'USD',
  subscriptionAmount: 0,
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
