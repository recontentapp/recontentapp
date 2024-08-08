export interface Variable {
  key: string
  defaultContent: string
  translations: Record<string, string>
}

export type Mode = 'code' | 'content'
