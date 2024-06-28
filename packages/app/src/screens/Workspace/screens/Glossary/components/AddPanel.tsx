import { useQueryClient } from '@tanstack/react-query'
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
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  getListGlossaryTermsQueryKey,
  useBatchCreateGlossaryTerms,
  useListWorkspaceLanguages,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

interface Props {
  glossaryId: string
  languageId: string
}

interface State {
  reference: {
    groupId: string
    languageId: string | null
    name: string
    description: string
    forbidden: boolean
    caseSensitive: boolean
  }
  otherLanguages: Array<{
    languageId: string
    name: string
    description: string
  }>
}

export const AddPanel = ({ glossaryId, languageId }: Props) => {
  const queryClient = useQueryClient()
  const { id: workspaceId } = useCurrentWorkspace()
  const { data: languagesData } = useListWorkspaceLanguages({
    queryParams: {
      workspaceId,
    },
  })
  const [state, setState] = useState<State>({
    reference: {
      groupId: uuidv4(),
      languageId,
      name: '',
      description: '',
      forbidden: false,
      caseSensitive: false,
    },
    otherLanguages: [],
  })
  const { mutateAsync, isPending } = useBatchCreateGlossaryTerms({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListGlossaryTermsQueryKey({
          queryParams: {
            glossaryId,
          },
        }),
      })
    },
  })

  const languageOptions = languagesData ?? []
  const usedLanguages = state.otherLanguages.map(s => s.languageId)
  const availableLanguages =
    languagesData?.filter(
      l => !usedLanguages.includes(l.id) && l.id !== state.reference.languageId,
    ) ?? []

  const canBeSubmitted =
    state.reference.name.length > 0 &&
    state.otherLanguages.every(l => l.name.length > 0)

  const onSubmit = () => {
    if (!canBeSubmitted) {
      return
    }

    mutateAsync({
      body: {
        glossaryId,
        terms: [
          {
            groupId: state.reference.groupId,
            languageId: state.reference.languageId,
            name: state.reference.name,
            description: state.reference.description || null,
            forbidden: state.reference.forbidden,
            caseSensitive: state.reference.caseSensitive,
          },
          ...state.otherLanguages.map(l => ({
            groupId: state.reference.groupId,
            languageId: l.languageId,
            name: l.name,
            description: l.description || null,
            forbidden: state.reference.forbidden,
            caseSensitive: state.reference.caseSensitive,
          })),
        ],
      },
    })
  }

  return (
    <Form onSubmit={onSubmit}>
      <Stack
        direction="column"
        paddingY="$space200"
        paddingX="$space100"
        spacing="$space300"
      >
        <Stack direction="column" spacing="$space100">
          <Heading renderAs="h2" size="$size200" color="$gray14">
            Add term
          </Heading>

          <Stack direction="column" spacing="$space80">
            <TextField
              label="Name"
              value={state.reference.name}
              placeholder="Enter term name"
              onChange={value => {
                setState({
                  reference: {
                    ...state.reference,
                    name: value,
                  },
                  otherLanguages: state.otherLanguages,
                })
              }}
            />

            <TextareaField
              label="Description"
              isOptional
              value={state.reference.description}
              placeholder="Enter term description"
              onChange={value => {
                setState({
                  reference: {
                    ...state.reference,
                    description: value,
                  },
                  otherLanguages: state.otherLanguages,
                })
              }}
            />

            {state.reference.languageId && (
              <SelectField
                label="Language"
                options={languageOptions.map(l => ({
                  label: l.name,
                  value: l.id,
                }))}
                value={state.reference.languageId}
                isDisabled
                onChange={() => {}}
              />
            )}

            <Switch
              label="Forbidden"
              value={state.reference.forbidden}
              onChange={value => {
                setState({
                  reference: {
                    ...state.reference,
                    forbidden: value,
                  },
                  otherLanguages: state.otherLanguages,
                })
              }}
            />

            <Switch
              label="Case sensitive"
              value={state.reference.caseSensitive}
              onChange={value => {
                setState({
                  reference: {
                    ...state.reference,
                    caseSensitive: value,
                  },
                  otherLanguages: state.otherLanguages,
                })
              }}
            />

            <Switch
              label="Translated"
              value={state.reference.languageId !== null}
              onChange={value => {
                if (!value) {
                  setState({
                    reference: {
                      ...state.reference,
                      languageId: null,
                    },
                    otherLanguages: [],
                  })
                  return
                }

                setState({
                  reference: {
                    ...state.reference,
                    languageId,
                  },
                  otherLanguages: [],
                })
              }}
            />
          </Stack>
        </Stack>

        {state.otherLanguages.map((language, index) => (
          <Stack key={index} direction="column" spacing="$space80">
            <SelectField
              label="Language"
              options={languageOptions.map(l => ({
                label: l.name,
                value: l.id,
              }))}
              value={language.languageId}
              onChange={option => {
                if (!option) {
                  return
                }

                setState(prevState => {
                  const newState = { ...prevState }
                  newState.otherLanguages[index].languageId = option.value
                  return newState
                })
              }}
            />

            <TextField
              label="Name"
              value={language.name}
              placeholder="Enter term name"
              onChange={value => {
                setState(prevState => {
                  const newState = { ...prevState }
                  newState.otherLanguages[index].name = value
                  return newState
                })
              }}
            />
            <TextareaField
              label="Description"
              isOptional
              placeholder="Enter term description"
              value={language.description}
              onChange={value => {
                setState(prevState => {
                  const newState = { ...prevState }
                  newState.otherLanguages[index].description = value
                  return newState
                })
              }}
            />

            <Box display="block">
              <Button
                icon="delete"
                onAction={() => {
                  setState(prevState => {
                    const newState = { ...prevState }
                    newState.otherLanguages.splice(index, 1)
                    return newState
                  })
                }}
                variation="danger"
                size="xsmall"
              >
                Delete
              </Button>
            </Box>
          </Stack>
        ))}

        <Stack direction="column" spacing="$space80">
          {state.reference.languageId !== null &&
            availableLanguages.length > 0 && (
              <Box display="block">
                <Button
                  size="small"
                  variation="secondary"
                  onAction={() => {
                    setState({
                      reference: state.reference,
                      otherLanguages: [
                        ...state.otherLanguages,
                        {
                          languageId: availableLanguages[0].id,
                          name: '',
                          description: '',
                        },
                      ],
                    })
                  }}
                >
                  Add matching term in another language
                </Button>
              </Box>
            )}

          <Box display="block">
            <Button
              size="small"
              isDisabled={!canBeSubmitted}
              type="submit"
              variation="primary"
              isLoading={isPending}
            >
              Save {state.otherLanguages.length > 0 ? 'terms' : 'term'}
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Form>
  )
}
