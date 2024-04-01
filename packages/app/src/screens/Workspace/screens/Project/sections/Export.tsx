import { FC, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import {
  Button,
  Stack,
  Banner,
  ExternalLink,
  Link,
  Heading,
} from '../../../../../components/primitives'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import {
  ExportToFileModal,
  ExportToFileModalRef,
} from '../components/ExportToFileModal'
import { useGetProject } from '../../../../../generated/reactQuery'
import routes from '../../../../../routing'

export const Export: FC = () => {
  const exportToFileModalRef = useRef<ExportToFileModalRef>(null)
  const { key: workspaceKey } = useCurrentWorkspace()
  const params = useParams<'projectId'>()
  const { data: project } = useGetProject({
    queryParams: { id: params.projectId! },
  })

  if (!project) {
    return <FullpageSpinner />
  }

  return (
    <Stack direction="column" spacing="$space300">
      <ExportToFileModal ref={exportToFileModalRef} />
      <Stack direction="column" spacing="$space200">
        <Stack direction="column" spacing="$space100">
          <Stack direction="row" spacing="$space60" alignItems="center">
            <Heading renderAs="h2" size="$size100">
              Destinations
            </Heading>
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
                  href="https://recontent.app/docs/cli"
                  title="CLI documentation"
                  target="_blank"
                >
                  CLI
                </ExternalLink>{' '}
                documentation or{' '}
                <ExternalLink
                  fontSize="$fontSize80"
                  icon={false}
                  href="https://recontent.app/docs/api"
                  title="REST API documentation"
                  target="_blank"
                >
                  REST API
                </ExternalLink>{' '}
                documentation to learn more. API keys can be generated from your{' '}
                <Link
                  size="$size80"
                  to={routes.workspaceSettingsIntegrations.url({
                    pathParams: { workspaceKey },
                  })}
                >
                  workspace settings
                </Link>
                .
              </span>
            }
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
