/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_AMPLITUDE_API_KEY: string
  readonly VITE_APP_SENTRY_DSN: string
  readonly VITE_APP_CRISP_WEBSITE_ID: string
  readonly VITE_APP_GITHUB_APP_INSTALLATION_URL: string
  readonly VITE_APP_GITHUB_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
