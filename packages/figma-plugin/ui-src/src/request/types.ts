type Method = 'get' | 'put' | 'post' | 'delete' | 'patch'

export type QueryParams = Record<string, undefined | string | string[] | number>

export interface Error {
  statusCode: number
  statusText: string
  url: string
}

export interface RequestConfig {
  baseUrl: string
  headers?: Record<string, string>
  onError?: (error: Error) => void
}

export interface RequestParams<
  Params extends Record<string, any>,
  Body extends Record<string, any>,
> {
  path: string
  method: Method
  params?: Params
  headers?: Record<string, string>
  body?: Body
  formData?: FormData
}

export interface RequestSuccessResponse<DataType> {
  ok: true
  statusCode: number
  data: DataType
}

export interface RequestErrorResponse<ErrorType> {
  ok: false
  statusCode: number
  error: ErrorType
}

export type RequestResponse<DataType, ErrorType> =
  | RequestSuccessResponse<DataType>
  | RequestErrorResponse<ErrorType>

export type Request = <
  DataType,
  ErrorType = unknown,
  Params = QueryParams,
  Body = Record<string, unknown>,
>(
  params: RequestParams<Params, Body>,
) => Promise<RequestResponse<DataType, ErrorType>>

export interface RequestProviderProps {
  baseUrl: string
  headers?: Record<string, string>
  onError?: (error: Error) => void
}
