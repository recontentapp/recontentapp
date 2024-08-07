import { HTMLRenderResult, renderHTML, renderTemplate } from 'email-renderer'
import { useEffect, useState } from 'react'
import useDebouncedCallback from '../../../../hooks/debouncedCallback'
import { Variable } from './types'

interface UseEmailPreviewParams {
  layout?: string
  layoutVariables?: Variable[]
  initialValue: string
  initialVariables: Variable[]
}

export const useEmailPreview = ({
  initialValue,
  initialVariables,
  layout,
  layoutVariables,
}: UseEmailPreviewParams) => {
  const [currentPreviewOption, setCurrentPreviewOption] = useState<
    string | null
  >(null)
  const [variables, setVariables] = useState(initialVariables)
  const [value, setValue] = useState(initialValue)
  const [preview, setPreview] = useState<HTMLRenderResult | null>(null)

  const updatePreview = useDebouncedCallback(
    (
      layout: string | undefined,
      layoutVariables: Variable[],
      value: string,
      variables: Variable[],
      currentPreviewOption: string | null,
    ) => {
      const renderedTemplate = renderTemplate({
        layout,
        layoutVariables: layoutVariables.reduce<Record<string, string>>(
          (acc, variable) => {
            const fallback = `{{{ ${variable.key} }}}`

            if (currentPreviewOption) {
              acc[variable.key] =
                variable.translations[currentPreviewOption] || fallback
            } else {
              acc[variable.key] = variable.defaultContent || fallback
            }
            return acc
          },
          {},
        ),
        template: value,
        variables: variables.reduce<Record<string, string>>((acc, variable) => {
          const fallback = `{{{ ${variable.key} }}}`

          if (currentPreviewOption) {
            acc[variable.key] =
              variable.translations[currentPreviewOption] || fallback
          } else {
            acc[variable.key] = variable.defaultContent || fallback
          }
          return acc
        }, {}),
      })

      if (!renderedTemplate) {
        setPreview(null)
        return
      }

      setPreview(renderHTML(renderedTemplate))
    },
    250,
  )

  useEffect(() => {
    updatePreview(
      layout,
      layoutVariables ?? [],
      value,
      variables,
      currentPreviewOption,
    )
  }, [
    value,
    variables,
    layout,
    layoutVariables,
    currentPreviewOption,
    updatePreview,
  ])

  return {
    onChangePreviewOption: setCurrentPreviewOption,
    preview,
    value,
    setValue,
    variables,
    setVariables,
  }
}
