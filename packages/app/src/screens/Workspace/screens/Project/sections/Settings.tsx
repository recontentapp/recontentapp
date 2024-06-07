import { FC, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Box,
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  DangerZone,
  Form,
  LinkWrapper,
  Metadata,
  Stack,
  Text,
  TextField,
  toast,
} from 'design-system'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import {
  getGetProjectQueryKey,
  getListProjectsQueryKey,
  useDeleteProject,
  useGetProject,
  useListWorkspaceLanguages,
  useUpdateProject,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { formatRelative } from '../../../../../utils/dates'
import { SettingsSection } from '../../../components/SettingsSection'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { AddLanguageForm } from '../components/AddLanguageForm'

export const Settings: FC = () => {
  const queryClient = useQueryClient()
  const params = useParams<'projectId'>()
  const [state, setState] = useState({
    name: '',
    description: '',
  })
  const { getName } = useReferenceableAccounts()
  const navigate = useNavigate()
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
  const { data: workspaceLanguages = [] } = useListWorkspaceLanguages({
    queryParams: { workspaceId },
  })
  const { mutateAsync: updateProject, isPending: isUpdatingProject } =
    useUpdateProject({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetProjectQueryKey({
            queryParams: { id: params.projectId! },
          }),
        })
      },
    })
  const {
    data: project,
    isLoading: projectLoading,
    failureCount,
  } = useGetProject({ queryParams: { id: params.projectId! } })
  const { mutateAsync: deleteProject, isPending: isDeletingProject } =
    useDeleteProject({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListProjectsQueryKey(),
        })
      },
    })
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)

  useEffect(() => {
    if (!project) {
      return
    }

    setState({
      name: project.name,
      description: project.description ?? '',
    })
  }, [project])

  const onUpdateProject = () => {
    updateProject({ body: { ...state, id: project!.id } })
      .then(() => {
        toast('success', {
          title: 'Project updated',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not update project',
        })
      })
  }

  const onRequestDeleteProject = () => {
    confirmationModalRef.current.confirm().then(result => {
      if (!result) {
        return
      }

      deleteProject({
        body: {
          projectId: params.projectId!,
        },
      })
        .then(() => {
          toast('success', {
            title: 'Project deleted',
          })
          navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
        })
        .catch(() => {
          toast('error', {
            title: 'Could not delete project',
            description: 'Feel free to try later or contact us',
          })
        })
    })
  }

  useEffect(() => {
    if (failureCount > 0) {
      navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
    }
  }, [failureCount, navigate, workspaceKey])

  if (projectLoading || !project) {
    return <FullpageSpinner />
  }

  return (
    <Stack width="100%" direction="column" spacing="$space400">
      <SettingsSection title="General" withBottomBar>
        <Box width="100%" maxWidth={400}>
          <Form width="100%" onSubmit={onUpdateProject}>
            <Stack width="100%" direction="column" spacing="$space200">
              <TextField
                label="Project name"
                placeholder="A name..."
                value={state.name}
                onChange={value =>
                  setState(state => ({
                    ...state,
                    name: value,
                  }))
                }
              />
              <TextField
                label="Project description"
                placeholder="A description..."
                value={state.description}
                onChange={value =>
                  setState(state => ({
                    ...state,
                    description: value,
                  }))
                }
              />
              <Metadata
                metadata={[
                  {
                    label: 'Created',
                    value: formatRelative(new Date(project.createdAt)),
                  },
                  {
                    label: 'Created by',
                    value: getName(project.createdBy),
                  },
                  {
                    label: 'Last update',
                    value: formatRelative(new Date(project.updatedAt)),
                  },
                  ...(project.updatedBy
                    ? [
                        {
                          label: 'Updated by',
                          value: getName(project.updatedBy),
                        },
                      ]
                    : []),
                ]}
              />

              <Box>
                <Button
                  type="submit"
                  variation="primary"
                  isLoading={isUpdatingProject}
                >
                  Update project details
                </Button>
              </Box>
            </Stack>
          </Form>
        </Box>
      </SettingsSection>

      <SettingsSection title="Languages" withBottomBar>
        {project.languages.length > 0 && (
          <Stack direction="column" renderAs="ul" spacing="$space60">
            {project.languages.map(language => (
              <Box renderAs="li" key={language.id}>
                <Badge variation="primary" size="medium">
                  {language.name}
                </Badge>
              </Box>
            ))}
          </Stack>
        )}

        {project.languages.length < workspaceLanguages.length && (
          <AddLanguageForm project={project} />
        )}

        <Box paddingTop="$space60">
          <Text size="$size80" color="$gray14" lineHeight="$lineHeight200">
            Want to use more languages? Add them in your{' '}
            <LinkWrapper size="$size80">
              <Link
                to={routes.workspaceSettingsLanguages.url({
                  pathParams: { workspaceKey },
                })}
              >
                workspace settings
              </Link>
            </LinkWrapper>
          </Text>
        </Box>
      </SettingsSection>

      <Box width="100%" maxWidth={400}>
        <DangerZone
          description="Deleting this project removes all phrase collections as well."
          cta="Delete project"
          onAction={onRequestDeleteProject}
          isLoading={isDeletingProject}
        />
      </Box>

      <ConfirmationModal
        ref={confirmationModalRef}
        title="Are you sure about deleting this project"
        description="Once deleted, a project or its phrases can not be recovered."
        variation="danger"
      />
    </Stack>
  )
}
