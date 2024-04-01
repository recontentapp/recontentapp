import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { State } from './types'
import { Form } from './steps/Form'
import { Mapping } from './steps/Mapping'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import {
  useGetProject,
  useImportPhrases,
} from '../../../../generated/reactQuery'
import routes from '../../../../routing'
import { toast } from '../../../../components/primitives'

export const ImportFromFile = () => {
  const navigate = useNavigate()
  const params = useParams<'projectId'>()
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const { mutateAsync: importPhrases, isPending: isImporting } =
    useImportPhrases()

  const [step, setStep] = useState<'form' | 'mapping'>('form')
  const [state, setState] = useState<State>({
    fileFormat: 'json',
  })
  const {
    data: project,
    isLoading: projectLoading,
    failureCount,
  } = useGetProject({ queryParams: { id: params.projectId! } })

  useEffect(() => {
    if (failureCount > 0) {
      navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
    }
  }, [failureCount, navigate, workspaceKey])

  const canBeSubmitted = !!state.file && !!state.fileFormat && !!state.language

  const onFormNext = () => {
    if (['excel', 'csv'].includes(state.fileFormat) && !state.mapping) {
      setState(state => ({
        ...state,
        mapping: {
          sheetName: undefined,
          rowStartIndex: 0,
          keyColumnIndex: undefined,
          translationColumnIndex: undefined,
        },
      }))
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

    if (state.mapping) {
      formData.append('mappingSheetName', state.mapping.sheetName || '')
      formData.append(
        'mappingRowStartIndex',
        state.mapping.rowStartIndex.toString(),
      )
      formData.append(
        'mappingKeyColumnIndex',
        state.mapping.keyColumnIndex!.toString(),
      )
      formData.append(
        'mappingTranslationColumnIndex',
        state.mapping.translationColumnIndex!.toString(),
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
      .catch(err => {
        console.log(err)
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
            isLoading={false}
          />
        )}

        {step === 'mapping' && (
          <Mapping
            state={state}
            updateState={setState}
            onSubmit={onSubmit}
            isLoading={false}
          />
        )}
      </Page>
    </ScreenWrapper>
  )
}
