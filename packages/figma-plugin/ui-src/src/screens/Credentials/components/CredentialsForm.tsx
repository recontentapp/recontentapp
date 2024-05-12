import { Bold, Text, Stack, Textbox, Link, Checkbox, Box } from 'figma-ui-kit'
import { getURLs } from '../../../utils/origins'
import { CredentialsValues } from '../types'

interface CredentialsFormProps {
  value: CredentialsValues
  onChange: (values: CredentialsValues) => void
}

export const CredentialsForm = ({ value, onChange }: CredentialsFormProps) => {
  return (
    <Stack width="100%" direction="column" spacing="$extraLarge">
      <Stack width="100%" direction="column" spacing="$extraSmall">
        <Bold>Personal API key</Bold>

        <div style={{ width: '100%' }}>
          <Textbox
            variant="border"
            placeholder="GMsmbHrpB77eNS0C8ytb9WSPEiZttrSV"
            value={value.apiKey}
            onChange={e =>
              onChange({
                apiKey: e.currentTarget.value,
                customOrigin: value.customOrigin,
              })
            }
          />
        </div>

        <Text>
          Get one in your{' '}
          <Link href={getURLs('default').app} target="_blank">
            Recontent.app
          </Link>{' '}
          user settings.
        </Text>
      </Stack>

      <Box alignItems="center">
        {/* @ts-expect-error */}
        <Checkbox
          value={value.customOrigin !== null}
          onValueChange={() =>
            onChange({
              apiKey: value.apiKey,
              customOrigin: value.customOrigin !== null ? null : '',
            })
          }
        />
        <Text>Using a self-hosted version?</Text>
      </Box>

      {value.customOrigin !== null && (
        <Stack width="100%" direction="column" spacing="$extraSmall">
          <Bold>Self-hosted URL</Bold>

          <div style={{ width: '100%' }}>
            <Textbox
              variant="border"
              placeholder="https://recontent.my-company.com"
              value={value.customOrigin}
              onChange={e =>
                onChange({
                  apiKey: value.apiKey,
                  customOrigin: e.currentTarget.value,
                })
              }
            />
          </div>
        </Stack>
      )}
    </Stack>
  )
}
