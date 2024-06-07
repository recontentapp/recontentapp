import {
  Box,
  Button,
  Form,
  SelectField,
  Stack,
  Text,
  TextField,
} from 'design-system'
import { useState } from 'react'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { useBridge } from '../../../../contexts/Bridge'
import { useCurrentCredentials } from '../../../../contexts/CurrentCredentials'
import {
  useCreateFigmaFile,
  useGetMe,
  useListProjects,
} from '../../../../generated/reactQuery'
import { isValidFigmaURL } from '../../../../utils/urls'
import { LanguageSelect } from './components/LanguageSelect'

interface State {
  name: string | undefined
  url: string | undefined
  projectId: string | undefined
  languageId: string | undefined
  revisionId: string | undefined
}

export const FileOnboarding = () => {
  const { file, emit } = useBridge()
  const { currentCredentials } = useCurrentCredentials()
  const { data } = useGetMe()
  const [state, setState] = useState<State>({
    name: file.name,
    url: undefined,
    projectId: undefined,
    languageId: undefined,
    revisionId: undefined,
  })
  const { data: projectsData } = useListProjects({
    queryParams: {},
  })
  const { mutateAsync, isPending: isCreating } = useCreateFigmaFile({
    onError: () => {
      emit({
        type: 'notification-requested',
        data: {
          message: 'Failed to link Figma file to Recontent.app',
          type: 'error',
        },
      })
    },
  })

  const canBeSubmitted =
    state.name &&
    state.url &&
    state.projectId &&
    state.languageId &&
    state.revisionId

  const onSubmit = async () => {
    if (
      isCreating ||
      !state.revisionId ||
      !state.languageId ||
      !state.url ||
      !state.name ||
      !data
    ) {
      return
    }

    const res = await mutateAsync({
      body: {
        revisionId: state.revisionId,
        languageId: state.languageId,
        url: state.url,
        name: state.name,
      },
    }).catch(() => null)

    if (!res) {
      return
    }

    emit({
      type: 'file-config-set',
      data: {
        id: res.id,
        languageId: state.languageId,
        revisionId: state.revisionId,
        workspaceId: res.workspaceId,
        workspaceKey: currentCredentials.workspaceKey,
        customOrigin: currentCredentials.customOrigin,
      },
    })
  }

  if (!data) {
    return <FullpageSpinner />
  }

  return (
    <Form onSubmit={onSubmit}>
      <Stack
        direction="column"
        spacing="$space200"
        paddingX="$space80"
        paddingY="$space80"
        paddingBottom="$space400"
      >
        <Text
          size="$size80"
          variation="semiBold"
          color="$gray14"
          lineHeight="$lineHeight200"
        >
          Hello {data.firstName} {data.lastName}, let's link{' '}
          <Text
            size="$size80"
            color="$purple800"
            variation="bold"
            renderAs="span"
            lineHeight="$lineHeight200"
          >
            {file.name}
          </Text>{' '}
          to Recontent.app!
        </Text>
        <TextField
          label="File name"
          value={state.name}
          placeholder="Untitled document"
          onChange={name => {
            setState(s => ({ ...s, name }))
          }}
        />

        <TextField
          label="File URL"
          value={state.url}
          placeholder="https://www.figma.com/design/:id/:name"
          info='Click on "Share" > "Copy link"'
          error={
            !state.url
              ? undefined
              : isValidFigmaURL(state.url).isValid
                ? undefined
                : 'Invalid file URL'
          }
          onChange={url => {
            setState(s => ({ ...s, url }))
          }}
        />

        <SelectField
          label="Project"
          placeholder="Select a project"
          options={(projectsData?.items ?? []).map(i => ({
            label: i.name,
            value: i.id,
          }))}
          value={state.projectId}
          onChange={option => {
            if (!option) {
              return
            }

            const project = projectsData?.items.find(i => i.id === option.value)
            if (!project) {
              return
            }

            setState(state => ({
              ...state,
              projectId: option.value,
              languageId: undefined,
              revisionId: project.masterRevisionId,
            }))
          }}
        />

        {state.projectId && (
          <LanguageSelect
            projectId={state.projectId}
            value={state.languageId}
            onSelect={option => {
              setState(s => ({
                ...s,
                languageId: option.value,
              }))
            }}
          />
        )}

        <Box>
          <Button
            type="submit"
            variation="primary"
            isDisabled={!canBeSubmitted}
            isLoading={isCreating}
          >
            Link Figma file to Recontent.app
          </Button>
        </Box>
      </Stack>
    </Form>
  )
}
