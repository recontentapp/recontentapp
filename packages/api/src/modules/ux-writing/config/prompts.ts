import { Components } from 'src/generated/typeDefinitions'

interface GetBatchTranslatePromptParams {
  sourceLanguageLabel: string
  targetLanguageLabel: string
  customTranslations?: Record<string, string>
  nonTranslatableTerms?: string[]
}

export const getBatchTranslatePrompt = ({
  sourceLanguageLabel,
  targetLanguageLabel,
  customTranslations,
  nonTranslatableTerms,
}: GetBatchTranslatePromptParams) => {
  const sections: string[] = [
    'You are a localization assistant designed to help create clear and user-friendly copy for digital products and services.',
    'Your goals are to:',
    `Use a JSON object of key/value pairs in ${sourceLanguageLabel} & translate them in ${targetLanguageLabel}`,
  ]

  if (customTranslations && Object.keys(customTranslations).length > 0) {
    sections.push(
      [
        'Use the following custom translations when needed:',
        JSON.stringify(customTranslations, null, 2),
      ].join('\n'),
    )
  }

  if (nonTranslatableTerms && nonTranslatableTerms.length > 0) {
    sections.push(
      [
        'If you encounter the following non-translatable keywords, keep them in the original language:',
        nonTranslatableTerms.map(term => `- "${term}"`).join('\n'),
      ].join('\n'),
    )
  }

  return sections.join('\n\n')
}

interface GetTranslatePromptParams {
  sourceLanguageLabel: string
  targetLanguageLabel: string
  customTranslations?: Record<string, string>
  nonTranslatableTerms?: string[]
}

export const getTranslatePrompt = ({
  sourceLanguageLabel,
  targetLanguageLabel,
  customTranslations,
  nonTranslatableTerms,
}: GetTranslatePromptParams) => {
  const sections: string[] = [
    'You are a localization assistant designed to help create clear and user-friendly copy for digital products and services.',
    'Your goals are to:',
    `Use a source text in ${sourceLanguageLabel} & translate it to ${targetLanguageLabel}`,
    'ONLY return one suggestion',
  ]

  if (customTranslations && Object.keys(customTranslations).length > 0) {
    sections.push(
      [
        'Use the following custom translations when needed:',
        JSON.stringify(customTranslations, null, 2),
      ].join('\n'),
    )
  }

  if (nonTranslatableTerms && nonTranslatableTerms.length > 0) {
    sections.push(
      [
        'If you encounter the following non-translatable keywords, keep them in the original language:',
        nonTranslatableTerms.map(term => `- "${term}"`).join('\n'),
      ].join('\n'),
    )
  }

  return sections.join('\n\n')
}

export const getTonePrompt = (
  tone: Components.Schemas.PromptTone | null,
): string => {
  switch (tone) {
    case 'casual':
      return 'Maintain a casual tone: friendly, respectful, informal'
    case 'conversational':
      return 'Maintain a conversational tone: positive, helpful, & engaging'
    case 'playful':
      return 'Maintain a playful tone: warm, a bit funny and informal'
    case 'professional':
      return 'Maintain a professional tone: formal, respectful, & without jargon'
    default:
      return ''
  }
}

export const getLengthPrompt = (
  length: Components.Schemas.PromptLength | null,
): string => {
  switch (length) {
    case 'shorter':
      return 'Make the content shorter'
    case 'longer':
      return 'Make the content longer'
    case 'same':
      return 'Maintain the same length of content'
    default:
      return ''
  }
}

interface GetRephrasePromptParams {
  forbiddenTerms?: string[]
  customInstructions?: string[]
  tone: Components.Schemas.PromptTone | null
  length: Components.Schemas.PromptLength | null
  sourceLanguageLabel: string
}

export const getRephrasePrompt = ({
  forbiddenTerms,
  customInstructions,
  sourceLanguageLabel,
  tone,
  length,
}: GetRephrasePromptParams) => {
  const sections: string[] = [
    'You are a UX writing assistant designed to help create clear and user-friendly copy for digital products and services.',
    'Your goals are to:',
    'Rephrase content',
    getTonePrompt(tone),
    `Maintain the source language in your output: ${sourceLanguageLabel}`,
    getLengthPrompt(length),
  ].filter(Boolean)

  if (customInstructions && customInstructions.length > 0) {
    sections.push(
      [
        'Use the following custom instructions:',
        customInstructions.map(instruction => `- ${instruction}`).join('\n'),
      ].join('\n'),
    )
  }

  if (forbiddenTerms && forbiddenTerms.length > 0) {
    sections.push(
      [
        'Never use the following terms:',
        forbiddenTerms.map(term => `- ${term}`).join('\n'),
      ].join('\n'),
    )
  }

  return sections.join('\n\n')
}
