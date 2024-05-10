import { useRef } from 'react'
import {
  Box,
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  ExternalLink,
  Heading,
  Stack,
  Text,
  toast,
} from '../../../../../components/primitives'
import { FIGMA_PLUGIN_URL } from '../../../../../constants'
import { useGenerateUserWorkspaceAccountAPIKey } from '../../../../../generated/reactQuery'
import {
  useCurrentAccount,
  useCurrentWorkspace,
} from '../../../../../hooks/workspace'

export const Workspace = () => {
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)
  const { id: workspaceId, name: workspaceName } = useCurrentWorkspace()
  const { hasAPIKey } = useCurrentAccount()
  const { mutateAsync, isPending } = useGenerateUserWorkspaceAccountAPIKey()

  const onGenerate = async () => {
    if (isPending) {
      return
    }

    if (hasAPIKey) {
      const result = await confirmationModalRef.current?.confirm()

      if (!result) {
        return
      }
    }

    mutateAsync({
      body: {
        workspaceId,
      },
    })
      .then(result => {
        alert(
          `Your API key is ${result.apiKey}. Make sure to copy it somewhere secure, it won't be available within the app in the future.`,
        )
        toast('success', {
          title: 'API key created',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create API key',
        })
      })
  }

  return (
    <Stack direction="column" spacing="$space100">
      <Heading renderAs="h2" size="$size200">
        For {workspaceName}
      </Heading>

      <Stack direction="column" spacing="$space100">
        <Box>
          <Button
            variation={hasAPIKey ? 'secondary' : 'primary'}
            isLoading={isPending}
            onAction={onGenerate}
          >
            {hasAPIKey
              ? 'Regenerate personal API key'
              : 'Generate personal API key'}
          </Button>
        </Box>

        <Text
          size="$size80"
          color="$gray11"
          maxWidth={400}
          lineHeight="$lineHeight200"
        >
          Personal API keys can be used with our{' '}
          <ExternalLink
            title="Recontent.app Figma plugin"
            href={FIGMA_PLUGIN_URL}
          >
            Figma plugin
          </ExternalLink>{' '}
          or to interact with our{' '}
          <ExternalLink
            title="Recontent.app public API"
            href="https://docs.recontent.app/developers/rest-api"
          >
            Public API
          </ExternalLink>
          .
        </Text>
      </Stack>

      <ConfirmationModal
        ref={confirmationModalRef}
        variation="primary"
        title="Are you sure about regenerating your personal API key?"
        description="Any existing integration relying on the current API key will stop working & will need to be updated."
      />
    </Stack>
  )
}
