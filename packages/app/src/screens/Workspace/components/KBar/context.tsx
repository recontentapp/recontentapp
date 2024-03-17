import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { Components } from '../../../../generated/typeDefinitions'

type Project = Components.Schemas.Project

interface KBarContext {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  project: Project | null
  projectRevision: string | null
  setProjectContext: (project: Project | null, revision: string | null) => void
}

const kbarContext = createContext<KBarContext>(null!)

export const useKBarContext = () => useContext(kbarContext)

export const KBarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null)
  const [projectRevision, setProjectRevision] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const setProjectContext = useCallback(
    (project: Project | null, revision: string | null) => {
      setProject(project)
      setProjectRevision(revision)
    },
    [],
  )

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      project,
      projectRevision,
      setProjectContext,
    }),
    [isOpen, project, projectRevision, setProjectContext],
  )

  return <kbarContext.Provider value={value}>{children}</kbarContext.Provider>
}
