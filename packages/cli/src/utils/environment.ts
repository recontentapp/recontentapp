const DEFAULT_API_URL = 'https://api.recontent.app'

export const API_KEY_ENV = 'RECONTENT_API_KEY'
export const API_URL_ENV = 'RECONTENT_API_URL'

export const getEnvironment = () => {
  return {
    apiKey: process.env[API_KEY_ENV] ?? null,
    apiUrl: process.env[API_URL_ENV] ?? DEFAULT_API_URL,
  }
}
