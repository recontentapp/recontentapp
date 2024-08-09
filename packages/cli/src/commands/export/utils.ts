import { render as mustacheRender } from 'mustache'

interface FormatOutputPathParams {
  template: string
  variables: {
    fileExtension: string
    language: {
      locale: string
      name: string
    }
    key: string
  }
}

export const formatOutputPath = ({
  template,
  variables,
}: FormatOutputPathParams) => {
  try {
    return mustacheRender(
      template,
      {
        fileExtension: variables.fileExtension,
        languageLocale: variables.language.locale,
        languageName: variables.language.name,
        key: variables.key,
      },
      {},
      {
        // Disable HTML escaping
        escape: val => val,
        tags: ['{{', '}}'],
      },
    )
  } catch (error) {
    return null
  }
}
