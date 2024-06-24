import {
  Box,
  Button,
  Form,
  Heading,
  SelectField,
  Stack,
  Switch,
  TextField,
  TextareaField,
} from 'design-system'
import { useEffect, useState } from 'react'
import {
  useBatchCreateGlossaryTerms,
  useListWorkspaceLanguages,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

interface Props {
  languageId: string
}

interface State {
  languageId: string | null
  name: string
  description: string | null
  forbidden: boolean
  caseSensitive: boolean
}

export const AddPanel = ({ languageId }: Props) => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { data: languagesData } = useListWorkspaceLanguages({
    queryParams: {
      workspaceId,
    },
  })
  const [state, setState] = useState<State[]>([
    {
      languageId: null,
      name: '',
      description: '',
      forbidden: false,
      caseSensitive: false,
    },
  ])
  const { mutateAsync, isPending } = useBatchCreateGlossaryTerms()

  useEffect(() => {
    if (!languagesData) {
      return
    }

    setState(prevState => {
      return prevState.map(s => ({
        ...s,
        languageId: languagesData.at(0)?.id ?? null,
      }))
    })
  }, [languagesData])

  const languageOptions = languagesData ?? []
  const currentLanguage = languageOptions.find(l => l.id === languageId) ?? null
  const usedLanguages = state.map(s => s.languageId).filter(Boolean)
  const availableLanguages =
    languagesData?.filter(l => !usedLanguages.includes(l.id)) ?? []

  return (
    <Form onSubmit={() => {}}>
      <Stack
        direction="column"
        paddingY="$space200"
        paddingX="$space100"
        spacing="$space100"
      >
        <Heading renderAs="h2" size="$size100" color="$gray14">
          Add term
        </Heading>

        {state.map((s, index) => (
          <Stack key={index} direction="column" spacing="$space80">
            {index === 0 && (
              <Switch
                label="Translated"
                value={s.languageId !== null}
                onChange={value => {
                  if (!value) {
                    setState(prevState => {
                      const newState = [...prevState]
                      newState[0].languageId = null
                      return [newState[0]]
                    })
                    return
                  }

                  setState(prevState => {
                    const newState = [...prevState]
                    newState[index].languageId =
                      languagesData?.at(0)?.id ?? null
                    return newState
                  })
                }}
              />
            )}
            {s.languageId ? (
              index !== 0 ? (
                <SelectField
                  label="Language"
                  options={languageOptions.map(l => ({
                    label: l.name,
                    value: l.id,
                  }))}
                  value={s.languageId}
                  onChange={option => {
                    if (!option) {
                      return
                    }

                    setState(prevState => {
                      const newState = [...prevState]
                      newState[index].languageId = option.value
                      return newState
                    })
                  }}
                />
              ) : (
                <p>{s.languageId}</p>
              )
            ) : null}

            <TextField
              label="Name"
              value={s.name}
              onChange={value => {
                setState(prevState => {
                  const newState = [...prevState]
                  newState[index].name = value
                  return newState
                })
              }}
            />
            <TextareaField
              label="Description"
              value={s.description ?? ''}
              onChange={value => {
                setState(prevState => {
                  const newState = [...prevState]
                  newState[index].description = value
                  return newState
                })
              }}
            />
            <Switch
              label="Forbidden"
              value={s.forbidden}
              onChange={value => {
                setState(prevState => {
                  const newState = [...prevState]
                  newState[index].forbidden = value
                  return newState
                })
              }}
            />
            <Switch
              label="Case sensitive"
              value={s.caseSensitive}
              onChange={value => {
                setState(prevState => {
                  const newState = [...prevState]
                  newState[index].caseSensitive = value
                  return newState
                })
              }}
            />
          </Stack>
        ))}

        {state[0].languageId !== null && availableLanguages.length > 0 && (
          <Box display="block">
            <Button
              size="small"
              variation="secondary"
              onAction={() => {
                console.log(availableLanguages)
                setState(prevState => {
                  return [
                    ...prevState,
                    {
                      languageId: availableLanguages[0].id,
                      name: '',
                      description: '',
                      forbidden: false,
                      caseSensitive: false,
                    },
                  ]
                })
              }}
            >
              Add matching term in another language
            </Button>
          </Box>
        )}
      </Stack>
    </Form>
  )
}
