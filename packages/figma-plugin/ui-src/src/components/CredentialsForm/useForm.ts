import { useState } from 'react'
import { useBridge } from '../../contexts/Bridge'
import { CredentialsValues } from './types'
import { HTTPRequestError, getAPIClient } from '../../generated/apiClient'
import { UserCredentials } from '../../../../shared-types'
import { getURLs } from '../../utils/origins'

export const useForm = (callback: () => void) => {
  const { userConfig, emit } = useBridge()
  const [isValidating, setIsValidating] = useState(false)
  const [credentials, setCredentials] = useState<CredentialsValues[]>(
    userConfig?.credentials
      ? userConfig.credentials.map(c => ({
          apiKey: c.apiKey,
          customOrigin: c.customOrigin,
          error: null,
        }))
      : [
          {
            apiKey: '',
            customOrigin: null,
            error: null,
          },
        ],
  )

  const validateCredentials = async () => {
    setIsValidating(true)

    const results = await Promise.allSettled(
      credentials.map(credential => {
        return getAPIClient({
          baseUrl: getURLs(credential.customOrigin).api,
          headers: {
            Authorization: `Bearer ${credential.apiKey}`,
          },
        }).getMe()
      }),
    )

    setIsValidating(false)
    const allValid = results.every(
      result => result.status === 'fulfilled' && result.value.ok,
    )

    if (!allValid) {
      emit({
        type: 'notification-requested',
        data: { message: 'Some credentials appear invalid', type: 'error' },
      })
      setCredentials(c =>
        c.map((credential, index) => {
          const result = results[index]
          const valid = result.status === 'fulfilled' && result.value.ok

          if (valid) {
            return {
              ...credential,
              error: null,
            }
          }

          const isUnauthorized =
            result.status === 'fulfilled' &&
            !result.value.ok &&
            result.value.error instanceof HTTPRequestError &&
            result.value.error.statusCode === 401

          return {
            ...credential,
            error: isUnauthorized ? 'apiKey' : 'customOrigin',
          }
        }),
      )
      return
    }

    const userCredentials: UserCredentials[] = []

    for (const [index, result] of results.entries()) {
      if (result.status !== 'fulfilled' || !result.value.ok) {
        continue
      }

      userCredentials.push({
        apiKey: credentials[index].apiKey,
        customOrigin: credentials[index].customOrigin,
        workspaceId: result.value.data.workspace.id,
        workspaceKey: result.value.data.workspace.key,
      })
    }

    emit({
      type: 'user-config-updated',
      data: {
        credentials: userCredentials,
      },
    })
    callback()
  }

  return {
    isValidating,
    credentials,
    setCredentials,
    validateCredentials,
  }
}
