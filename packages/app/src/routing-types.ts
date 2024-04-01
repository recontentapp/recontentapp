interface QueryParam {
  type: 'string' | 'number' | 'boolean'
  enum?: string[]
  required?: boolean
}

type Metadata = string | number | boolean | null | undefined

export interface Route {
  name: string
  queryParams?: Record<string, QueryParam>
  metadata?: Record<string, Metadata | Metadata[]>
}

export type RoutesCollection = Record<string, Route>
