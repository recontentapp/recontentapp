import { Stack, TextField, ExternalLink, Switch } from 'design-system'
import { getURLs } from '../../../utils/origins'
import { CredentialsValues } from '../types'

interface CredentialsFormProps {
  value: CredentialsValues
  onChange: (values: CredentialsValues) => void
}

export const Form = ({ value, onChange }: CredentialsFormProps) => {
  return (
    <Stack width="100%" direction="column" spacing="$space100">
      <Stack width="100%" direction="column" spacing="$space100">
        <TextField
          label="Personal API key"
          placeholder="Paste your 32 characters API key here"
          value={value.apiKey}
          error={
            value.error === 'apiKey' ? 'Invalid personal API key' : undefined
          }
          onChange={e =>
            onChange({
              error: value.error,
              apiKey: e,
              customOrigin: value.customOrigin,
            })
          }
          info={
            <span>
              Get one in your{' '}
              <ExternalLink href={getURLs('default').app} title="Recontent.app">
                Recontent.app
              </ExternalLink>{' '}
              user settings.
            </span>
          }
        />

        <Switch
          label="Using a self-hosted version?"
          value={value.customOrigin !== null}
          onChange={checked => {
            onChange({
              error: value.error,
              apiKey: value.apiKey,
              customOrigin: checked ? '' : null,
            })
          }}
        />
      </Stack>

      {value.customOrigin !== null && (
        <TextField
          label="Self-hosted URL"
          placeholder="https://recontent.my-company.com"
          error={
            value.error === 'customOrigin'
              ? 'Invalid self-hosted URL'
              : undefined
          }
          value={value.customOrigin}
          onChange={val =>
            onChange({
              error: value.error,
              apiKey: value.apiKey,
              customOrigin: val,
            })
          }
        />
      )}
    </Stack>
  )
}
