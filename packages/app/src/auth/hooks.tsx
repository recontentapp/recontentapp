import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { toast } from 'design-system'
import { getAPIClient } from '../generated/apiClient'
import { CurrentUser, Status } from './types'

export interface AuthContext {
  accessToken: string | null
  currentUser: CurrentUser | null
  status: Status
  refetchUser: () => void
  signOut: () => void
  signIn: (token: string) => void
}

const authContext = createContext<AuthContext>(null!)
const LOCAL_STORAGE_KEY = 'accessToken'

export const AuthProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem(LOCAL_STORAGE_KEY),
  )
  const [status, setStatus] = useState<Status>('loading')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setStatus('idle')
      return
    }

    const apiClient = getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    apiClient
      .getCurrentUser()
      .then(res => {
        if (!res.ok) {
          setStatus('idle')
          return
        }

        setCurrentUser(res.data)
        setStatus('authenticated')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  const refetchUser = useCallback(async () => {
    const apiClient = getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    apiClient.getCurrentUser().then(res => {
      if (!res.ok) {
        return
      }

      setCurrentUser(res.data)
    })
  }, [accessToken])

  const signIn = useCallback(async (accessToken: string) => {
    const apiClient = getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    apiClient.getCurrentUser().then(res => {
      if (!res.ok) {
        toast('error', {
          title: 'Error while signing you in',
          description: 'Credentials not valid',
        })
        return
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, accessToken)
      setAccessToken(accessToken)
      setCurrentUser(res.data)
      setStatus('authenticated')
    })
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setAccessToken(null)
    setCurrentUser(null)
    setStatus('idle')
  }, [])

  const value = useMemo(() => {
    return {
      status,
      accessToken,
      currentUser,
      signOut,
      signIn,
      refetchUser,
    }
  }, [status, accessToken, signOut, currentUser, signIn, refetchUser])

  return <authContext.Provider value={value}>{children}</authContext.Provider>
}

export const useAuth = () => useContext(authContext)
export const useCurrentUser = () => useContext(authContext).currentUser!
