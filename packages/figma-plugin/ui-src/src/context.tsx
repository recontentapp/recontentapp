import React, {
  createContext,
  FC,
  useCallback,
  useContext as useReactContext,
  useMemo,
  useState,
} from 'react'
import { useEmit, useOn } from './io'
import {
  Emittable,
  FigmaText,
  Initialized,
  Receivable,
  TextsSelected,
} from './types'

export type Screen = 'Inspect' | 'Settings'

interface Context {
  screen: Screen
  apiKey: string | null
  id: string | null
  name: string
  traversed: boolean
  selectedTexts: FigmaText[]
  updateScreen: (screen: Screen) => void
  resetAPIKey: () => void
  emit: (data: Emittable) => void
}

const context = createContext<Context>({
  screen: 'Inspect',
  apiKey: null,
  id: null,
  name: '',
  traversed: false,
  selectedTexts: [],
  updateScreen: () => {},
  emit: () => {},
  resetAPIKey: () => {},
})

export const useContext = () => useReactContext(context)

export const ContextProvider: FC = ({ children }) => {
  const [screen, updateScreen] = useState<Screen>('Inspect')
  const [isReady, setIsReady] = useState(false)
  const [traversed, setTraversed] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [selectedTexts, setSelectedTexts] = useState<FigmaText[]>([])

  const emit = useEmit<Emittable>()
  useOn<Receivable>({
    initialized: (message: Initialized) => {
      const { apiToken, id, selectedTexts, name, traversed } = message.data
      setApiKey(apiToken)
      setName(name)
      setId(id)
      setSelectedTexts(selectedTexts)
      setTraversed(traversed)
      setIsReady(true)
    },
    textsSelected: (message: TextsSelected) => {
      setSelectedTexts(message.data.selectedTexts)
      setTraversed(message.data.traversed)
    },
  })

  const resetAPIKey = useCallback(() => setApiKey(null), [])

  const value = useMemo(
    () => ({
      id,
      emit,
      apiKey,
      traversed,
      name,
      screen,
      selectedTexts,
      updateScreen,
      isReady,
      resetAPIKey,
    }),
    [id, selectedTexts, name, traversed, apiKey, screen, emit, resetAPIKey],
  )

  if (!isReady) {
    return null
  }

  return <context.Provider value={value}>{children}</context.Provider>
}
