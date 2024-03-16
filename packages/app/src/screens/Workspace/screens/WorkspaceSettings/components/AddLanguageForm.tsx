import { FC, useMemo, useState } from 'react'

import {
  Box,
  Button,
  ComboboxField,
  Stack,
  TextField,
  toast,
} from '../../../../../components/primitives'
import {
  useAddLanguagesToWorkspace,
  useListWorkspaceLanguages,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { languageLocales } from '../../../../../utils/locales'

export interface State {
  name: string
  locale: string
}

interface AddLanguageFormProps {
  onClose: () => void
}

export const AddLanguageForm: FC<AddLanguageFormProps> = ({ onClose }) => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { mutateAsync, isPending } = useAddLanguagesToWorkspace()
  const { data: languages = [], isLoading: isLoadingLanguages } =
    useListWorkspaceLanguages({ queryParams: { workspaceId } })
  const [state, setState] = useState<State>({
    name: '',
    locale: '',
  })

  const availableLocales = useMemo(() => {
    const workspaceLocales = languages.map(language => language.locale)
    return languageLocales
      .filter(locale => !workspaceLocales.includes(locale))
      .map(c => ({
        label: c,
        value: c,
      }))
  }, [languages])

  const onKeyChange = (values: string[]) => {
    const [value] = values
    const matchingOption = languageLocales.find(option => option === value)
    if (!matchingOption) {
      return
    }

    setState({
      name: matchingOption,
      locale: matchingOption,
    })
  }

  const onSubmit = () => {
    mutateAsync({
      body: {
        workspaceId: workspaceId,
        languages: [
          {
            name: state.name,
            locale: state.locale,
          },
        ],
      },
    })
      .then(() => {
        onClose()
        toast('success', {
          title: 'Language added to workspace',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not add locale to workspace',
        })
      })
  }

  const canBeSubmitted = state.locale.length > 0 && state.name.length > 0

  if (isPending || isLoadingLanguages) {
    return null
  }

  return (
    <Box paddingTop="$space60" paddingBottom="$space60">
      <Stack direction="row" alignItems="flex-start" spacing="$space60">
        <ComboboxField
          hideLabel
          label="Locale"
          placeholder="Locale"
          value={state.locale ? [state.locale] : undefined}
          options={availableLocales}
          onChange={onKeyChange}
          onSearchChange={() =>
            setState(state => ({
              ...state,
              key: '',
            }))
          }
        />

        <TextField
          hideLabel
          label="Name"
          placeholder="Name"
          value={state.name}
          onChange={value =>
            setState(state => ({
              ...state,
              name: value,
            }))
          }
        />

        <Button
          variation="primary"
          isDisabled={!canBeSubmitted}
          onAction={onSubmit}
        >
          Add
        </Button>

        <Button variation="secondary" onAction={onClose}>
          Close
        </Button>
      </Stack>
    </Box>
  )
}
