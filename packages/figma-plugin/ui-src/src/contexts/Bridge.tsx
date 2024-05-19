import {
  createContext,
  useCallback,
  useContext as useReactContext,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { useEmit, useOn } from '../io'
import {
  Text,
  PluginInitialized,
  UserConfig,
  FileConfig,
  TextSelectionChanged,
} from '../../../shared-types'
import { Emittable, Receivable } from '../types'

export type Screen = 'Inspect' | 'Settings'

type State = Pick<
  Bridge,
  'screen' | 'file' | 'userConfig' | 'selection' | 'currentPage'
>

const defaultState: State = {
  screen: 'Inspect',
  file: {
    name: '',
    config: null,
  },
  userConfig: null,
  currentPage: {
    nodeId: '',
    lastSyncedAt: null,
  },
  selection: {
    texts: [],
    traversed: false,
  },
}

interface Bridge {
  screen: Screen
  updateScreen: (screen: Screen) => void
  userConfig: UserConfig | null
  file: {
    name: string
    config: FileConfig | null
  }
  currentPage: {
    nodeId: string
    lastSyncedAt: number | null
  }
  selection: {
    texts: Text[]
    traversed: boolean
  }
  emit: (data: Emittable) => void
}

const context = createContext<Bridge>({
  ...defaultState,
  updateScreen: () => {},
  emit: () => {},
})

export const useBridge = () => useReactContext(context)

interface BridgeProviderProps {
  children: ReactNode
}

export const BridgeProvider = ({ children }: BridgeProviderProps) => {
  const [isReady, setIsReady] = useState(false)
  const [state, setState] = useState<State>(defaultState)

  const emit = useEmit<Emittable>()
  useOn<Receivable>({
    'plugin-initialized': (message: PluginInitialized) => {
      const { userConfig, currentPage, file, selection } = message.data
      setState({
        screen: 'Inspect',
        file,
        userConfig,
        currentPage,
        selection,
      })
      setIsReady(true)
    },
    'text-selection-changed': (message: TextSelectionChanged) => {
      setState(state => ({
        ...state,
        selection: message.data,
      }))
    },
  })

  const updateScreen = useCallback(
    (screen: Screen) =>
      setState(state => ({
        ...state,
        screen,
      })),
    [],
  )

  const value: Bridge = useMemo(
    () => ({
      ...state,
      emit,
      updateScreen,
    }),
    [state, emit, updateScreen],
  )

  if (!isReady) {
    return null
  }

  return <context.Provider value={value}>{children}</context.Provider>
}
