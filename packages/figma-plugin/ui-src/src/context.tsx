import {
  createContext,
  useCallback,
  useContext as useReactContext,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { useEmit, useOn } from './io'
import {
  Text,
  PluginInitialized,
  UserConfig,
  FileConfig,
} from '../../shared-types'
import { Emittable, Receivable } from './types'

export type Screen = 'Inspect' | 'Settings'
type State = Pick<
  Context,
  'screen' | 'fileConfig' | 'fileName' | 'userConfig' | 'selection'
>

const defaultState: State = {
  screen: 'Inspect',
  fileConfig: null,
  fileName: '',
  userConfig: null,
  selection: {
    texts: [],
    traversed: false,
  },
}

interface Context {
  screen: Screen
  updateScreen: (screen: Screen) => void
  fileConfig: FileConfig | null
  fileName: string
  userConfig: UserConfig | null
  selection: {
    texts: Text[]
    traversed: boolean
  }
  emit: (data: Emittable) => void
}

const context = createContext<Context>({
  ...defaultState,
  updateScreen: () => {},
  emit: () => {},
})

export const useContext = () => useReactContext(context)

interface ContextProviderProps {
  children: ReactNode
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [isReady, setIsReady] = useState(false)
  const [state, setState] = useState<State>(defaultState)

  const emit = useEmit<Emittable>()
  useOn<Receivable>({
    'plugin-initialized': (message: PluginInitialized) => {
      const { userConfig, fileConfig, fileName, selection } = message.data
      setState({
        screen: 'Inspect',
        fileConfig,
        fileName,
        userConfig,
        selection,
      })
      setIsReady(true)
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

  const value: Context = useMemo(
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
