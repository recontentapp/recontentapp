import { Form } from './components/Form'
import {
  Banner,
  Box,
  Button,
  Heading,
  MinimalButton,
  Stack,
} from 'design-system'
import { useForm } from './useForm'

interface CredentialsProps {
  isOnboarding?: boolean
  onUpdate: () => void
}

export const CredentialsForm = ({
  isOnboarding,
  onUpdate,
}: CredentialsProps) => {
  const { credentials, setCredentials, isValidating, validateCredentials } =
    useForm(onUpdate)

  return (
    <Stack
      direction="column"
      spacing="$space200"
      width="100%"
      paddingX="$space80"
      paddingTop="$space80"
      paddingBottom="$space400"
    >
      {isOnboarding ? (
        <Banner
          variation="info"
          description="Start by creating a personal API key to connect Figma to Recontent.app"
        />
      ) : (
        <Heading renderAs="h1" size="$size200" color="$gray14">
          Your credentials
        </Heading>
      )}

      <Stack direction="column" spacing="$space200">
        {credentials.map((credential, index) => {
          return (
            <Stack direction="column" spacing="$space80">
              <Form
                key={index}
                value={credential}
                onChange={values =>
                  setCredentials(c => {
                    const newCredentials = [...c]
                    newCredentials[index] = values
                    return newCredentials
                  })
                }
              />

              {credentials.length > 1 && (
                <Box>
                  <MinimalButton
                    variation="danger"
                    icon="delete"
                    onAction={() => {
                      setCredentials(c => {
                        const newCredentials = [...c]
                        newCredentials.splice(index, 1)
                        return newCredentials
                      })
                    }}
                  >
                    Delete credentials
                  </MinimalButton>
                </Box>
              )}

              {credentials.length > 1 && index < credentials.length - 1 && (
                <hr />
              )}
            </Stack>
          )
        })}
      </Stack>

      {!isOnboarding && (
        <MinimalButton
          variation="primary"
          icon="add"
          onAction={() =>
            setCredentials(c => [
              ...c,
              { apiKey: '', customOrigin: null, error: null },
            ])
          }
        >
          Add another set of credentials
        </MinimalButton>
      )}

      <Stack direction="row" spacing="$space40">
        <Button
          variation="primary"
          isLoading={isValidating}
          onAction={validateCredentials}
        >
          Save credentials
        </Button>

        {!isOnboarding && (
          <Button variation="secondary" onAction={onUpdate}>
            Exit
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
