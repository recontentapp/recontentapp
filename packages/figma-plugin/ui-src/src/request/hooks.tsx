import React, { createContext, FC, useContext, useMemo } from 'react'

import { Request, RequestProviderProps } from './types'
import { request } from './request'

const requestContext = createContext<Request>(null!)

export const useRequest = () => useContext(requestContext)

export const RequestProvider: FC<RequestProviderProps> = ({
  baseUrl,
  headers,
  onError,
  children,
}) => {
  const requestObject = useMemo(
    () =>
      request({
        baseUrl,
        onError,
        headers,
      }),
    [baseUrl, headers, onError],
  )

  return (
    <requestContext.Provider value={requestObject}>
      {children}
    </requestContext.Provider>
  )
}
