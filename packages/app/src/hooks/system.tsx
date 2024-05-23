import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { getAPIClient } from '../generated/apiClient'
import { Paths } from '../generated/typeDefinitions'

type System = Paths.GetSystem.Responses.$200

const systemContext = createContext<System>({
  version: '0.0.0',
  distribution: 'self-hosted',
  settings: {
    workspaceInviteOnly: false,
    cdnAvailable: false,
    googleOAuthAvailable: false,
    feedbacksAvailable: false,
  },
})

export const SystemProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState<System>({
    version: '0.0.0',
    distribution: 'self-hosted',
    settings: {
      workspaceInviteOnly: false,
      cdnAvailable: false,
      googleOAuthAvailable: false,
      feedbacksAvailable: false,
    },
  })

  useEffect(() => {
    const apiClient = getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
    })

    apiClient.getSystem().then(res => {
      if (!res.ok) {
        return
      }

      setValue(res.data)
    })
  }, [])

  return (
    <systemContext.Provider value={value}>{children}</systemContext.Provider>
  )
}

export const useSystem = () => useContext(systemContext)
