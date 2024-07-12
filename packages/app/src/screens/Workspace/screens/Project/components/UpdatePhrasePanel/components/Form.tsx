import { Stack } from 'design-system'
import { PhraseEditor } from '../../../../../../../components/PhraseEditor'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { isLocaleRTL } from '../../../../../../../utils/locales'
import { State } from '../types'
import { AutotranslateButton } from './AutotranslateButton'
import { RewriteButton } from './RewriteButton'

interface OnChangeOptions {
  resetInitialState: boolean
}

interface Props {
  projectId: string
  initialState: State
  state: State
  onChange: (value: string, options: OnChangeOptions) => void
  language: Components.Schemas.Language
  isLoading: boolean
}

export const Form = ({
  projectId,
  initialState,
  state,
  onChange,
  isLoading,
  language,
}: Props) => {
  const isRTL = isLocaleRTL(language.locale)
  const initialValue = initialState[language.id]

  return (
    <Stack direction="column" spacing="$space60">
      <PhraseEditor
        width="100%"
        direction={isRTL ? 'rtl' : 'ltr'}
        label={language.name}
        placeholder="Translation content"
        isDisabled={isLoading}
        initialValue={initialValue}
        onChange={content => onChange(content, { resetInitialState: false })}
      />

      <Stack direction="row" spacing="$space60">
        <AutotranslateButton
          currentValue={{
            languageId: language.id,
            content: state[language.id] ?? '',
          }}
          languages={Object.entries(state).map(([languageId, content]) => ({
            languageId,
            content,
          }))}
          onChange={content => onChange(content, { resetInitialState: true })}
        />

        <RewriteButton
          projectId={projectId}
          content={state[language.id] ?? ''}
          languageId={language.id}
          onChange={content => onChange(content, { resetInitialState: true })}
        />
      </Stack>
    </Stack>
  )
}
