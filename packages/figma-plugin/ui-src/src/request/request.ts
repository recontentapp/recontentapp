import queryString from 'query-string'

import {
  QueryParams,
  RequestConfig,
  RequestParams,
  RequestResponse,
} from './types'

const createUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, any>,
): string => {
  const fullUrl = [baseUrl.replace(/\/$/, ''), path.replace(/^\//, '')].join(
    '/',
  )
  const query = params
    ? queryString.stringify(params, { arrayFormat: 'comma' })
    : ''
  return [fullUrl, query].filter(Boolean).join('?')
}

export const request =
  (config: RequestConfig) =>
  async <
    DataType,
    ErrorType,
    Params = QueryParams,
    Body = Record<string, unknown>,
  >(
    params: RequestParams<Params, Body>,
  ): Promise<RequestResponse<DataType, ErrorType>> => {
    const headers: Record<string, string> = params.headers ?? {}
    let body: string | FormData | undefined

    if (params.body) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(params.body)
    }

    if (params.formData) {
      body = params.formData
    }

    const response = await fetch(
      createUrl(config.baseUrl, params.path, params.params),
      {
        body,
        headers: { ...config.headers, ...headers },
        method: params.method.toUpperCase(),
      },
    )

    const responseBody = await response.json().catch(() => null)

    if (!response.ok) {
      config.onError?.({
        statusCode: response.status,
        statusText: response.statusText,
        url: response.url,
      })
    }

    return response.ok
      ? {
          data: responseBody,
          ok: true,
          statusCode: response.status,
        }
      : {
          error: responseBody,
          ok: false,
          statusCode: response.status,
        }
  }
