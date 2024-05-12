import { Button, Text, Section } from 'figma-ui-kit'
import { useState } from 'react'
import { useContext } from '../../context'
import { CredentialsForm } from './components/CredentialsForm'
import { CredentialsValues } from './types'

export const Credentials = () => {
  const { userConfig, fileConfig } = useContext()
  const [credentials, setCredentials] = useState<CredentialsValues[]>(
    userConfig?.credentials
      ? userConfig.credentials.map(c => ({
          apiKey: c.apiKey,
          customOrigin: c.customOrigin,
        }))
      : [
          {
            apiKey: '',
            customOrigin: null,
          },
          {
            apiKey: '',
            customOrigin: null,
          },
          {
            apiKey: '',
            customOrigin: null,
          },
        ],
  )

  return (
    <>
      <Text>
        Recontent helps product teams collaborate on content for web & mobile
        apps.
      </Text>

      {credentials.map((credential, index) => {
        const title =
          credentials.length > 1
            ? `Credentials #${index + 1}`
            : 'Add credentials'

        return (
          <Section title={title}>
            <CredentialsForm
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

            <Button danger secondary>
              Delete
            </Button>
          </Section>
        )
      })}
    </>
  )
}
