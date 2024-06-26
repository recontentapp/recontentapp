import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'design-system'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import {
  getListPhrasesQueryKey,
  useGetProject,
  useImportPhrases,
} from '../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { Form } from './steps/Form'
import { Mapping } from './steps/Mapping'
import { State } from './types'

export const ImportFromFile = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const params = useParams<'projectId'>()
  const {
    data: project,
    isLoading: projectLoading,
    failureCount,
  } = useGetProject({ queryParams: { id: params.projectId! } })
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const { mutateAsync: importPhrases, isPending: isImporting } =
    useImportPhrases({
      onSuccess: () => {
        if (!project?.masterRevisionId) {
          return
        }

        queryClient.invalidateQueries({
          queryKey: getListPhrasesQueryKey({
            queryParams: {
              revisionId: project.masterRevisionId,
            },
          }),
        })
      },
    })

  const [step, setStep] = useState<'form' | 'mapping'>('form')
  const [state, setState] = useState<State>({
    fileFormat: 'json',
    tagIds: [],
  })

  useEffect(() => {
    if (failureCount > 0) {
      navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
    }
  }, [failureCount, navigate, workspaceKey])

  const canBeSubmitted = !!state.file && !!state.fileFormat && !!state.language

  const onFormNext = () => {
    if (['excel', 'csv'].includes(state.fileFormat)) {
      setStep('mapping')
      return
    }

    onSubmit()
  }

  const onSubmit = () => {
    if (!canBeSubmitted || !project || isImporting || !state.language) {
      return
    }

    const formData = new FormData()
    formData.append('file', state.file!)
    formData.append('fileFormat', state.fileFormat)
    formData.append('revisionId', project.masterRevisionId)
    formData.append('languageId', state.language?.id)

    if (state.tagIds.length > 0) {
      formData.append('tagIds', state.tagIds.join(','))
    }

    if (state.mapping && ['excel', 'csv'].includes(state.fileFormat)) {
      if (state.mapping.sheetName) {
        formData.append('mappingSheetName', String(state.mapping.sheetName))
      }

      formData.append(
        'mappingRowStartIndex',
        state.mapping.rowStartIndex.toString(),
      )
      formData.append(
        'mappingKeyColumnIndex',
        state.mapping.keyColumnIndex.toString(),
      )
      formData.append(
        'mappingTranslationColumnIndex',
        state.mapping.translationColumnIndex.toString(),
      )
    }

    importPhrases({
      body: formData,
    })
      .then(() => {
        toast('success', {
          title: 'Phrases imported',
          description: 'All phrases are now imported in your revision',
        })
        navigate(
          routes.projectPhrases.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
              revisionId: project.masterRevisionId,
            },
          }),
        )
      })
      .catch(() => {
        toast('error', {
          title: 'Could not import phrases',
        })
      })
  }

  if (projectLoading || !project) {
    return <FullpageSpinner />
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: project.name,
          path: routes.projectImport.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
            },
          }),
        },
        {
          label: 'Import from file',
          path: routes.projectImportFromFile.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
            },
          }),
        },
      ]}
    >
      <Head title={`Import phrases - ${project.name}`} />
      <Page subtitle={project.name} title="Import phrases">
        {step === 'form' && (
          <Form
            state={state}
            updateState={setState}
            project={project}
            canMoveToNextStep={canBeSubmitted}
            onSubmit={onFormNext}
            isLoading={isImporting}
          />
        )}

        {step === 'mapping' && (
          <Mapping
            state={state}
            updateState={setState}
            onSubmit={onSubmit}
            isLoading={isImporting}
          />
        )}
      </Page>
    </ScreenWrapper>
  )
}
