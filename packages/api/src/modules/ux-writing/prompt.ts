import { Components } from 'src/generated/typeDefinitions'

export const isValidPromptTone = (
  tone: string,
): tone is Components.Schemas.PromptTone => {
  return [
    'apologetic',
    'casual',
    'catchy',
    'confident',
    'conversational',
    'convincing',
    'crisp',
    'empathetic',
    'engaging',
    'enthusiastic',
    'exciting',
    'formal',
    'friendly',
    'funny',
    'happy',
    'helpful',
    'inclusive',
    'informative',
    'intelligent',
    'inviting',
    'kind',
    'playful',
    'polite',
    'positive',
    'professional',
    'upbeat',
    'warm',
    'witty',
  ].includes(tone)
}

export const isValidPromptLength = (
  length: string,
): length is Components.Schemas.PromptLength => {
  return ['shorter', 'longer', 'same'].includes(length)
}
