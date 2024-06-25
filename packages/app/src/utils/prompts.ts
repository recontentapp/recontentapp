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
  { value: 'apologetic', label: 'Apologetic' },
  { value: 'casual', label: 'Casual' },
  { value: 'catchy', label: 'Catchy' },
  { value: 'confident', label: 'Confident' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'convincing', label: 'Convincing' },
  { value: 'crisp', label: 'Crisp' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'engaging', label: 'Engaging' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'exciting', label: 'Exciting' },
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'funny', label: 'Funny' },
  { value: 'happy', label: 'Happy' },
  { value: 'helpful', label: 'Helpful' },
  { value: 'inclusive', label: 'Inclusive' },
  { value: 'informative', label: 'Informative' },
  { value: 'intelligent', label: 'Intelligent' },
  { value: 'inviting', label: 'Inviting' },
  { value: 'kind', label: 'Kind' },
  { value: 'playful', label: 'Playful' },
  { value: 'polite', label: 'Polite' },
  { value: 'positive', label: 'Positive' },
  { value: 'professional', label: 'Professional' },
  { value: 'upbeat', label: 'Upbeat' },
  { value: 'warm', label: 'Warm' },
  { value: 'witty', label: 'Witty' },
]
