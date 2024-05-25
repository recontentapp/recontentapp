import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useLocation } from 'react-router-dom'

import {
  CreateProjectModal,
  CreateProjectModalRef,
} from '../components/modals/CreateProjectModal'
import {
  CreatePhraseModal,
  CreatePhraseModalRef,
} from '../components/modals/CreatePhraseModal'
import {
  CreateDestinationModal,
  CreateDestinationModalRef,
} from '../components/modals/CreateDestinationModal'
import {
  CreateTagModal,
  CreateTagModalRef,
} from '../components/modals/CreateTagModal'

interface ModalsContext {
  openCreateProject: CreateProjectModalRef['open']
  openCreatePhrase: CreatePhraseModalRef['open']
  openCreateTag: CreateTagModalRef['open']
  openCreateDestination: CreateDestinationModalRef['open']
  closeAll: () => void
}

const modalsContext = createContext<ModalsContext>(null!)

export const useModals = () => useContext(modalsContext)

export const ModalsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()
  const createProjectModalRef = useRef<CreateProjectModalRef>(null!)
  const createPhraseModalRef = useRef<CreatePhraseModalRef>(null!)
  const createDestinationModalRef = useRef<CreateDestinationModalRef>(null!)
  const createTagModalRef = useRef<CreateTagModalRef>(null!)

  const openCreateProject: CreateProjectModalRef['open'] = useCallback(() => {
    createProjectModalRef.current?.open()
  }, [])
  const openCreateTag: CreateTagModalRef['open'] = useCallback((...props) => {
    createTagModalRef.current?.open(...props)
  }, [])
  const openCreatePhrase: CreatePhraseModalRef['open'] = useCallback(
    (...props) => {
      createPhraseModalRef.current?.open(...props)
    },
    [],
  )
  const openCreateDestination: CreateDestinationModalRef['open'] = useCallback(
    (...props) => {
      createDestinationModalRef.current?.open(...props)
    },
    [],
  )

  const closeAll = useCallback(() => {
    createProjectModalRef.current.close()
    createPhraseModalRef.current.close()
    createDestinationModalRef.current.close()
    createTagModalRef.current.close()
  }, [])

  useEffect(() => {
    closeAll()
  }, [location.pathname, closeAll])

  const value = useMemo(
    () => ({
      openCreateProject,
      openCreatePhrase,
      openCreateDestination,
      openCreateTag,
      closeAll,
    }),
    [
      closeAll,
      openCreateProject,
      openCreateTag,
      openCreatePhrase,
      openCreateDestination,
    ],
  )

  return (
    <modalsContext.Provider value={value}>
      <CreateProjectModal ref={createProjectModalRef} />
      <CreatePhraseModal ref={createPhraseModalRef} />
      <CreateDestinationModal ref={createDestinationModalRef} />
      <CreateTagModal ref={createTagModalRef} />

      {children}
    </modalsContext.Provider>
  )
}
