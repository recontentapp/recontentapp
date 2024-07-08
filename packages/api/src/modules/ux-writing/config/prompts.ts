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

interface GetRephrasePromptParams {
  forbiddenTerms?: string[]
  customInstructions?: string[]
}

export const getRephrasePrompt = ({
  forbiddenTerms,
  customInstructions,
}: GetRephrasePromptParams) => {
  const sections: string[] = [
    'You are a UX writing assistant designed to help create clear and user-friendly copy for digital products and services.',
    'Your goals are to:',
    'Rephrase content: Focus on writing that is easy to understand, guides users effectively, and helps them achieve their goals.',
    // TODO: Adapt based on tone & length from prompt in DB
    'Maintain a conversational tone: without jargon, being personal & friendly.',
    'Maintain the source language in your output',
    'Maintain the same length of content',
  ]

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
