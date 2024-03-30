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
import { useLocation, useNavigate } from 'react-router-dom'

import { useCurrentUser } from '../auth'
import { Components } from '../generated/typeDefinitions'
import routes from '../routing'

type Workspace = Components.Schemas.Workspace
type Account = Components.Schemas.CurrentUser['accounts'][number]

interface WorkspaceContext {
  isReady: boolean
  currentAccount: Account | null
  currentWorkspace: Workspace | null
  updateCurrentAccount: (account: Account) => void
  availableAccounts: Account[]
}

const workspaceContext = createContext<WorkspaceContext>(null!)

const parseLocationForWorkspaceKey = (pathname: string): string | null => {
  if (pathname.length === 0) {
    return null
  }

  const parts = pathname.split('/')

  if (!parts[1]) {
    return null
  }

  return parts[1]
}

const getPreferredWorkspace = () => {
  return localStorage.getItem('CurrentWorkspace')
}

const setPreferredWorkspace = (workspaceId: string) => {
  return localStorage.setItem('CurrentWorkspace', workspaceId)
}

export const CurrentWorkspaceProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { accounts } = useCurrentUser()
  const [isReady, setIsReady] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)

  useEffect(() => {
    if (accounts.length === 0) {
      setIsReady(true)
      return
    }

    const workspaceKeyInURL = parseLocationForWorkspaceKey(location.pathname)

    /**
     * Have access to only 1 workspace means this one will be used.
     * Fix path if not correct (eg. `/sign-up` whereas we're already logged in)
     */
    if (accounts.length === 1) {
      const onlyWorkspace = accounts[0].workspace

      if (workspaceKeyInURL !== onlyWorkspace.key) {
        navigate(
          routes.dashboard.url({
            pathParams: { workspaceKey: onlyWorkspace.key },
          }),
          { replace: true },
        )
      }

      setCurrentAccount(accounts[0])
      setIsReady(true)
      return
    }

    /**
     * Specifying a workspace key in URL has priority
     * over user preferences (eg. link shared)
     * If not found, fallback to user preferences
     */
    if (workspaceKeyInURL) {
      const account = accounts.find(
        account => account.workspace.key === workspaceKeyInURL,
      )

      if (account) {
        setPreferredWorkspace(account.workspace.id)
        setCurrentAccount(account)
        setIsReady(true)
        return
      }
    }

    /**
     * Look up existing user preferences
     * to display preferred workspace
     * If not found, fallback to workspace selector
     */
    const workspaceIdInLocalStorage = getPreferredWorkspace()
    if (workspaceIdInLocalStorage) {
      const account = accounts.find(
        account => account.workspace.id === workspaceIdInLocalStorage,
      )

      if (account) {
        setCurrentAccount(account)
        setIsReady(true)

        if (workspaceKeyInURL !== account.workspace.key) {
          navigate(
            routes.dashboard.url({
              pathParams: { workspaceKey: account.workspace.key },
            }),
            {
              replace: true,
            },
          )
        }

        return
      }
    }

    /**
     * Redirect to root to workspace selector
     */
    if (location.pathname !== '/') {
      navigate('/', { replace: true })
    }

    setIsReady(true)
  }, [accounts])

  const updateCurrentAccount = useCallback(
    (account: Account) => {
      setPreferredWorkspace(account.workspace.id)
      navigate(
        routes.dashboard.url({
          pathParams: { workspaceKey: account.workspace.key },
        }),
      )
      setCurrentAccount(account)
    },
    [navigate],
  )

  const value: WorkspaceContext = useMemo(
    () => ({
      isReady,
      currentAccount,
      updateCurrentAccount,
      availableAccounts: accounts,
      currentWorkspace: currentAccount?.workspace || null,
    }),
    [currentAccount, accounts, isReady, updateCurrentAccount],
  )

  return (
    <workspaceContext.Provider value={value}>
      {children}
    </workspaceContext.Provider>
  )
}

export const useLooseCurrentWorkspace = () => useContext(workspaceContext)

export const useCurrentWorkspace = () => {
  const { currentWorkspace } = useContext(workspaceContext)

  if (!currentWorkspace) {
    throw new Error('No current workspace')
  }

  return currentWorkspace
}

export const useCurrentAccount = () => {
  const { currentAccount } = useContext(workspaceContext)

  if (!currentAccount) {
    throw new Error('No current account')
  }

  return useMemo(
    () => ({
      ...currentAccount,
      canAdmin: () =>
        currentAccount.role === 'owner' || currentAccount.role === 'biller',
    }),
    [currentAccount],
  )
}
