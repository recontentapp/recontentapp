import { Box, Stack } from 'design-system'
import { PhraseEditor } from '../../../../../../../components/PhraseEditor'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { isLocaleRTL } from '../../../../../../../utils/locales'

interface Props {
  initialValue: string
  index: number
  onChange: (value: string) => void
  language: Components.Schemas.Language
  isLoading: boolean
}

export const Form = ({
  initialValue,
  onChange,
  isLoading,
  index,
  language,
}: Props) => {
  const isRTL = isLocaleRTL(language.locale)

  return (
    <Stack
      width="100%"
      direction="row"
      spacing="$space60"
      alignItems="flex-start"
      key={language.id}
    >
      <Box
        flexGrow={1}
        testId={index === 0 ? 'phrase-modal-first-field' : undefined}
      >
        <PhraseEditor
          width="100%"
          direction={isRTL ? 'rtl' : 'ltr'}
          label={language.name}
          placeholder="Translation content"
          isDisabled={isLoading}
          initialValue={initialValue}
          onChange={onChange}
        />
      </Box>
    </Stack>
  )
}
