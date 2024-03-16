import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

import {
  CreateProjectModal,
  CreateProjectModalRef,
} from '../components/modals/CreateProjectModal'

interface ModalsContext {
  openCreateProject: CreateProjectModalRef['open']
  closeAll: () => void
}

const modalsContext = createContext<ModalsContext>(null!)

export const useModals = () => useContext(modalsContext)

export const ModalsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const createProjectModalRef = useRef<CreateProjectModalRef>(null!)

  const openCreateProject: CreateProjectModalRef['open'] = useCallback(() => {
    createProjectModalRef.current?.open()
  }, [])

  const closeAll = useCallback(() => {
    createProjectModalRef.current.close()
  }, [])

  const value = useMemo(
    () => ({
      openCreateProject,
      closeAll,
    }),
    [closeAll, openCreateProject],
  )

  return (
    <modalsContext.Provider value={value}>
      <CreateProjectModal ref={createProjectModalRef} />

      {children}
    </modalsContext.Provider>
  )
}
