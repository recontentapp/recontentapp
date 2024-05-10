import { Command } from 'commander'
import { HTTPRequestError, getAPIClient } from '../generated/apiClient'

const DEFAULT_API_URL = 'https://api.recontent.app/public'

export const API_KEY_ENV = 'RECONTENT_API_KEY'
export const API_URL_ENV = 'RECONTENT_API_URL'

export const getEnvironment = () => {
  return {
    apiKey: process.env[API_KEY_ENV] ?? null,
    apiUrl: process.env[API_URL_ENV] ?? DEFAULT_API_URL,
  }
}

export const getApiClient = (command: Command) => {
  const { apiKey, apiUrl } = getEnvironment()
  const apiClient = getAPIClient({
    baseUrl: apiUrl,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    onError: error => {
      if (error instanceof HTTPRequestError) {
        command.error(`API request error: ${error.statusCode}`)
      }

      command.error(`Unknown API request error: ${String(error)}`)
    },
  })

  return apiClient
}
