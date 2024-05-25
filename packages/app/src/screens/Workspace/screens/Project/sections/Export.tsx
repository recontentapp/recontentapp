import { FC, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import {
  Button,
  Stack,
  Banner,
  ExternalLink,
  LinkWrapper,
  Heading,
} from 'design-system'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../hooks/workspace'
import {
  ExportToFileModal,
  ExportToFileModalRef,
} from '../components/ExportToFileModal'
import {
  useGetProject,
  useListDestinations,
} from '../../../../../generated/reactQuery'
import routes from '../../../../../routing'
import { useModals } from '../../../hooks/modals'
import { DestinationCard } from '../components/DestinationCard'

export const Export: FC = () => {
  const navigate = useNavigate()
  const params = useParams<'projectId'>()
  const exportToFileModalRef = useRef<ExportToFileModalRef>(null)
  const { key: workspaceKey } = useCurrentWorkspace()
  const { openCreateDestination } = useModals()
  const canManageProjectDestinations = useHasAbility(
    'projects:destinations:manage',
  )
  const { data } = useListDestinations({
    queryParams: { projectId: params.projectId! },
  })
  const { data: project } = useGetProject({
    queryParams: { id: params.projectId! },
  })

  if (!project) {
    return <FullpageSpinner />
  }

  return (
    <Stack direction="column" spacing="$space300">
      <ExportToFileModal ref={exportToFileModalRef} />

      <Stack direction="column" spacing="$space300">
        <Stack direction="column" spacing="$space100">
          <Stack direction="row" spacing="$space60" alignItems="center">
            <Heading renderAs="h2" size="$size100">
              Destinations
            </Heading>

            {canManageProjectDestinations && (
              <Button
                variation="primary"
                icon="add"
                size="xsmall"
                onAction={() => openCreateDestination(project)}
              >
                Add
              </Button>
            )}

            <Button
              variation="secondary"
              icon="file"
              size="xsmall"
              onAction={() => exportToFileModalRef.current?.open({ project })}
            >
              Export to a file
            </Button>
          </Stack>

          <Banner
            variation="info"
            title="Working on custom integrations or development workflows?"
            description={
              <span>
                Recontent is built to be integrated with other services. Check
                out our{' '}
                <ExternalLink
                  fontSize="$fontSize80"
                  icon={false}
                  href="https://docs.recontent.app/developers/command-line-interface-cli"
                  title="CLI documentation"
                >
                  CLI
                </ExternalLink>{' '}
                documentation or{' '}
                <ExternalLink
                  fontSize="$fontSize80"
                  icon={false}
                  href="https://docs.recontent.app/developers/rest-api"
                  title="REST API documentation"
                >
                  REST API
                </ExternalLink>{' '}
                documentation to learn more. API keys can be generated from your{' '}
                <LinkWrapper size="$size80">
                  <Link
                    to={routes.workspaceSettingsIntegrations.url({
                      pathParams: { workspaceKey },
                    })}
                  >
                    workspace settings
                  </Link>
                </LinkWrapper>
                .
              </span>
            }
          />
        </Stack>

        {canManageProjectDestinations && (
          <Stack direction="row" spacing="$space100">
            {data?.items.map(destination => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onAction={() => {
                  navigate(
                    routes.projectDestination.url({
                      pathParams: {
                        workspaceKey,
                        projectId: project.id,
                        destinationId: destination.id,
                      },
                    }),
                  )
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
