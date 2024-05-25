import { HTTPRequestError } from '../generated/apiClient'

export const isUpsellIssue = (error: unknown) => {
  return (
    typeof error === 'object' &&
    error &&
    'error' in error &&
    error.error instanceof HTTPRequestError &&
    error.error.statusCode === 418
  )
}
