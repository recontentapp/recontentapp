import {
  HTMLRenderResult,
  isLayoutValid,
  renderHTML,
  renderTemplate,
} from 'email-renderer'
import mjml2html from 'mjml-browser'
import { useEffect, useState } from 'react'
import useDebouncedCallback from '../../../../hooks/debouncedCallback'
import { Variable } from './types'

interface UseEmailTemplatePreviewParams {
  layout?: string
  layoutVariables?: Variable[]
  initialValue: string
  initialVariables: Variable[]
}

export const useEmailTemplatePreview = ({
  initialValue,
  initialVariables,
  layout,
  layoutVariables,
}: UseEmailTemplatePreviewParams) => {
  const [currentPreviewOption, setCurrentPreviewOption] = useState<
    string | null
  >(null)
  const [variables, setVariables] = useState(initialVariables)
  const [value, setValue] = useState(initialValue)
  const [preview, setPreview] = useState<HTMLRenderResult | null>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    setVariables(initialVariables)
  }, [initialVariables])

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
        setPreview({
          html: null,
          errors: {
            messages: ['Error while rendering template'],
            level: 'error',
          },
        })
        return
      }

      setPreview(renderHTML(renderedTemplate, mjml2html))
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

interface UseEmailLayoutPreviewParams {
  initialValue: string
  initialVariables: Variable[]
}

export const useEmailLayoutPreview = ({
  initialValue,
  initialVariables,
}: UseEmailLayoutPreviewParams) => {
  const [currentPreviewOption, setCurrentPreviewOption] = useState<
    string | null
  >(null)
  const [variables, setVariables] = useState(initialVariables)
  const [value, setValue] = useState(initialValue)
  const [preview, setPreview] = useState<HTMLRenderResult | null>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    setVariables(initialVariables)
  }, [initialVariables])

  const updatePreview = useDebouncedCallback(
    (
      value: string,
      variables: Variable[],
      currentPreviewOption: string | null,
    ) => {
      const formattedVariables = variables.reduce<Record<string, string>>(
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
      )

      const renderedTemplate = renderTemplate({
        layout: undefined,
        layoutVariables: undefined,
        template: value,
        variables: formattedVariables,
      })

      if (!renderedTemplate) {
        setPreview({
          html: null,
          errors: {
            messages: ['Error while rendering template'],
            level: 'error',
          },
        })
        return
      }

      const result = renderHTML(renderedTemplate, mjml2html)
      if (!isLayoutValid(value)) {
        if (!result.errors) {
          result.errors = {
            messages: [],
            level: 'warning',
          }
        }
        result.errors.messages.push('Template does not include {{{ content }}}')
      }

      setPreview(result)
    },
    250,
  )

  useEffect(() => {
    updatePreview(value, variables, currentPreviewOption)
  }, [value, variables, currentPreviewOption, updatePreview])

  return {
    onChangePreviewOption: setCurrentPreviewOption,
    preview,
    value,
    setValue,
    variables,
    setVariables,
  }
}
