import { Components } from 'src/generated/typeDefinitions'

export const isValidPromptTone = (
  tone: string,
): tone is Components.Schemas.PromptTone => {
  return ['professional', 'casual', 'playful', 'conversational'].includes(tone)
}

export const isValidPromptLength = (
  length: string,
): length is Components.Schemas.PromptLength => {
  return ['shorter', 'longer', 'same'].includes(length)
}
