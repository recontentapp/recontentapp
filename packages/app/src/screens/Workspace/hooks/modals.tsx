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
  CreateDestinationModal,
  CreateDestinationModalRef,
} from '../components/modals/CreateDestinationModal'
import {
  CreateEmailLayoutModal,
  CreateEmailLayoutModalRef,
} from '../components/modals/CreateEmailLayoutModal'
import {
  CreateEmailTemplateModal,
  CreateEmailTemplateModalRef,
} from '../components/modals/CreateEmailTemplateModal'
import {
  CreateGlossaryModal,
  CreateGlossaryModalRef,
} from '../components/modals/CreateGlossaryModal'
import {
  CreatePhraseModal,
  CreatePhraseModalRef,
} from '../components/modals/CreatePhraseModal'
import {
  CreateProjectModal,
  CreateProjectModalRef,
} from '../components/modals/CreateProjectModal'
import {
  CreateTagModal,
  CreateTagModalRef,
} from '../components/modals/CreateTagModal'
import {
  UpsertPromptModal,
  UpsertPromptModalRef,
} from '../components/modals/UpsertPromptModal'

interface ModalsContext {
  openCreateProject: CreateProjectModalRef['open']
  openCreatePhrase: CreatePhraseModalRef['open']
  openCreateTag: CreateTagModalRef['open']
  openCreateDestination: CreateDestinationModalRef['open']
  openCreateGlossary: CreateGlossaryModalRef['open']
  openUpsertPrompt: UpsertPromptModalRef['open']
  openCreateEmailLayout: CreateEmailLayoutModalRef['open']
  openCreateEmailTemplate: CreateEmailTemplateModalRef['open']
  closeAll: () => void
}

const modalsContext = createContext<ModalsContext>(null!)

export const useModals = () => useContext(modalsContext)

export const ModalsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()
  const createProjectModalRef = useRef<CreateProjectModalRef>(null!)
  const createGlossaryModalRef = useRef<CreateGlossaryModalRef>(null!)
  const createPhraseModalRef = useRef<CreatePhraseModalRef>(null!)
  const createDestinationModalRef = useRef<CreateDestinationModalRef>(null!)
  const createTagModalRef = useRef<CreateTagModalRef>(null!)
  const upsertPromptModalRef = useRef<UpsertPromptModalRef>(null!)
  const createEmailLayoutModalRef = useRef<CreateEmailLayoutModalRef>(null!)
  const createEmailTemplateModalRef = useRef<CreateEmailTemplateModalRef>(null!)

  const openCreateProject: CreateProjectModalRef['open'] = useCallback(() => {
    createProjectModalRef.current?.open()
  }, [])
  const openCreateGlossary: CreateGlossaryModalRef['open'] = useCallback(() => {
    createGlossaryModalRef.current?.open()
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
  const openUpsertPrompt: UpsertPromptModalRef['open'] = useCallback(
    (...props) => {
      upsertPromptModalRef.current?.open(...props)
    },
    [],
  )
  const openCreateEmailLayout: CreateEmailLayoutModalRef['open'] = useCallback(
    (...props) => {
      createEmailLayoutModalRef.current?.open(...props)
    },
    [],
  )
  const openCreateEmailTemplate: CreateEmailTemplateModalRef['open'] =
    useCallback((...props) => {
      createEmailTemplateModalRef.current?.open(...props)
    }, [])

  const closeAll = useCallback(() => {
    createProjectModalRef.current.close()
    createPhraseModalRef.current.close()
    createDestinationModalRef.current.close()
    createTagModalRef.current.close()
    createGlossaryModalRef.current.close()
    upsertPromptModalRef.current.close()
    createEmailLayoutModalRef.current.close()
    createEmailTemplateModalRef.current.close()
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
      openCreateGlossary,
      openUpsertPrompt,
      openCreateEmailLayout,
      openCreateEmailTemplate,
      closeAll,
    }),
    [
      closeAll,
      openCreateProject,
      openCreateGlossary,
      openCreateTag,
      openCreatePhrase,
      openCreateDestination,
      openUpsertPrompt,
      openCreateEmailLayout,
      openCreateEmailTemplate,
    ],
  )

  return (
    <modalsContext.Provider value={value}>
      <CreateProjectModal ref={createProjectModalRef} />
      <CreatePhraseModal ref={createPhraseModalRef} />
      <CreateDestinationModal ref={createDestinationModalRef} />
      <CreateTagModal ref={createTagModalRef} />
      <CreateGlossaryModal ref={createGlossaryModalRef} />
      <UpsertPromptModal ref={upsertPromptModalRef} />
      <CreateEmailLayoutModal ref={createEmailLayoutModalRef} />
      <CreateEmailTemplateModal ref={createEmailTemplateModalRef} />

      {children}
    </modalsContext.Provider>
  )
}
