export type Variables = Record<string, string>

export interface HTMLRenderResult {
  html: string | null
  errors: string[]
  level: 'error' | 'warning' | 'info'
}
