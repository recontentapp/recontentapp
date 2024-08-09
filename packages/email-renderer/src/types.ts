export type Variables = Record<string, string>

export interface HTMLRenderResult {
  html: string | null
  errors: {
    messages: string[]
    level: 'error' | 'warning'
  } | null
}
