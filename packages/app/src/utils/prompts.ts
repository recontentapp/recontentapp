import { Components } from '../generated/typeDefinitions'

export const promptLengthOptions: {
  value: Components.Schemas.PromptLength
  label: string
}[] = [
  { value: 'shorter', label: 'Shorter' },
  { value: 'longer', label: 'Longer' },
  { value: 'same', label: 'Same' },
]

export const promptToneOptions: {
  value: Components.Schemas.PromptTone
  label: string
}[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'playful', label: 'Playful' },
  { value: 'professional', label: 'Professional' },
]
