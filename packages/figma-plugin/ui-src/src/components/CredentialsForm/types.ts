export interface CredentialsValues {
  apiKey: string
  customOrigin: string | null
  error: 'apiKey' | 'customOrigin' | null
}
