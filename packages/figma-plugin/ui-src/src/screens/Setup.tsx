import {
  Bold,
  Box,
  Button,
  Dropdown,
  Link,
  Muted,
  Stack,
  Text,
  Textbox,
} from 'figma-ui-kit'
import React, { FormEvent, useState } from 'react'
import {
  useCreateFigmaDocument,
  useLanguagesByProject,
  useProjects,
  useRevisionsByProject,
} from '../api'
import { getAppURL } from '../config'
import { useContext } from '../context'

const DEFAULT_REVISION = 'master'

interface State {
  fileURL: string
  projectId: string | null
  languageId: string | null
  revisionId: string | null
}

interface LanguageSelectProps {
  projectId: string
  onSelect: (languageId: string) => void
}

const LanguageSelect = ({ projectId, onSelect }: LanguageSelectProps) => {
  const { data = [] } = useLanguagesByProject(projectId)
  const [value, setValue] = useState<string | null>(null)

  return (
    <Dropdown
      name="language"
      id="language"
      variant="border"
      value={value}
      placeholder="English - en"
      onChange={e => {
        onSelect(e.target.value)
        setValue(e.target.value)
      }}
      options={data.map(language => ({
        value: language.id,
        text: language.name,
      }))}
    />
  )
}

interface RevisionSelectProps {
  projectId: string
  onSelect: (revisionId: string) => void
}

const RevisionSelect = ({ projectId, onSelect }: RevisionSelectProps) => {
  const { data = [] } = useRevisionsByProject(projectId)
  const [value, setValue] = useState<string | null>(null)

  return (
    <Dropdown
      name="revision"
      id="revision"
      value={value}
      onChange={e => {
        onSelect(e.target.value)
        setValue(e.target.value)
      }}
      variant="border"
      placeholder="Master"
      options={[
        { value: DEFAULT_REVISION, text: 'Master' },
        ...data.map(revision => ({ value: revision.id, text: revision.name })),
      ]}
    />
  )
}

export const Setup = () => {
  const { name, emit } = useContext()
  const { data = [], isLoading: isLoadingProjects } = useProjects()
  const { mutateAsync, isLoading } = useCreateFigmaDocument()
  const [state, setState] = useState<State>({
    fileURL: '',
    projectId: null,
    languageId: null,
    revisionId: DEFAULT_REVISION,
  })

  const canBeSubmitted =
    state.fileURL.length > 0 &&
    state.projectId != null &&
    state.languageId != null &&
    state.revisionId != null

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!canBeSubmitted) {
      return
    }

    mutateAsync({
      name,
      url: state.fileURL,
      project_id: state.projectId!,
      revision_id: state.revisionId!,
      language_id: state.languageId!,
    })
      .then(id => {
        emit({ type: 'projectCreated', data: { id } })
      })
      .catch(() => {
        emit({
          type: 'notificationRequested',
          data: { message: 'Could not connect file to Recontent.app' },
        })
      })
  }

  const help = 'Click "Share" > "Copy link"'
  const doesNotHaveProjects = !isLoadingProjects && data.length === 0

  if (doesNotHaveProjects) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box maxWidth={200}>
          <Muted style={{ textAlign: 'center' }}>
            Welcome to Recontent.app! Start by{' '}
            <Link href={getAppURL()} target="_blank">
              creating a new project
            </Link>{' '}
            & reload the plugin to link it to your Figma file.
          </Muted>
        </Box>
      </Box>
    )
  }

  return (
    <Box padding="$medium">
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack width="100%" direction="column" spacing="$large">
          <Stack width="100%" direction="column" spacing="$medium">
            <Stack width="100%" direction="column" spacing="$extraSmall">
              <Bold>File URL</Bold>
              <Textbox
                variant="border"
                placeholder="https://wwww.figma.com/file/K5jnXGS87q3W2inmmOOFfs/Name"
                value={state.fileURL}
                onChange={e =>
                  setState(state => ({
                    ...state,
                    // @ts-expect-error
                    fileURL: e.target.value,
                  }))
                }
              />
              <Muted>{help}</Muted>
            </Stack>

            <Stack width="100%" direction="column" spacing="$extraSmall">
              <Bold>Choose a project</Bold>
              <Dropdown
                name="project"
                variant="border"
                placeholder="Webapp"
                style={{ width: '100%' }}
                id="project"
                value={state.projectId}
                options={data.map(project => ({
                  value: project.id,
                  text: project.name,
                }))}
                onChange={e => {
                  setState(state => ({
                    fileURL: state.fileURL,
                    projectId: e.target.value,
                    revisionId: DEFAULT_REVISION,
                    languageId: '',
                  }))
                }}
              />
            </Stack>

            {state.projectId && (
              <>
                <Stack width="100%" direction="column" spacing="$extraSmall">
                  <Bold>Choose a language</Bold>
                  <LanguageSelect
                    projectId={state.projectId}
                    onSelect={languageId =>
                      setState(state => ({
                        ...state,
                        languageId,
                      }))
                    }
                  />
                </Stack>

                {/* <Stack width="100%" direction="column" spacing="$extraSmall">
                  <Bold>Choose a revision</Bold>
                  <RevisionSelect
                    projectId={state.projectId}
                    onSelect={revisionId =>
                      setState(state => ({
                        ...state,
                        revisionId,
                      }))
                    }
                  />
                </Stack> */}
              </>
            )}
          </Stack>

          <Button disabled={!canBeSubmitted || isLoading}>
            {isLoading ? 'Loading...' : 'Connect Recontent.app to file'}
          </Button>
        </Stack>
      </form>
    </Box>
  )
}
