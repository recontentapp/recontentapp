import { Components } from 'src/generated/typeDefinitions'

export const promptTones: Components.Schemas.PromptTone[] = [
  'professional',
  'casual',
  'playful',
  'conversational',
]

export const promptLengths: Components.Schemas.PromptLength[] = [
  'shorter',
  'longer',
  'same',
]

export const isValidPromptTone = (
  tone: string,
): tone is Components.Schemas.PromptTone => {
  return promptTones.map(String).includes(tone)
}

export const isValidPromptLength = (
  length: string,
): length is Components.Schemas.PromptLength => {
  return promptLengths.map(String).includes(length)
}
