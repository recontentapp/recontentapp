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
import { useGetProject } from '../../../../generated/reactQuery'
import routes from '../../../../routing'

export const ImportFromFile = () => {
  const navigate = useNavigate()
  const params = useParams<'projectId'>()
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()

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

  const canBeSubmitted = !!state.file && !!state.fileFormat && !!state.locale

  const onFormNext = () => {
    if (['excel', 'csv'].includes(state.fileFormat) && !state.mapping) {
      setState(state => ({
        ...state,
        mapping: {
          sheetIndex: 0,
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
    if (!canBeSubmitted) {
      return
    }

    // mutateAsync({
    //   project_id: params.projectId!,
    //   revision_id: state.revisionId,
    //   locale: state.locale!,
    //   file: state.file!,
    //   file_format: state.fileFormat,
    //   tags: state.tags,
    //   mapping: state.mapping
    //     ? {
    //         sheetIndex: state.mapping.sheetIndex,
    //         rowStartIndex: state.mapping.rowStartIndex,
    //         keyColumnIndex: state.mapping.keyColumnIndex!,
    //         translationColumnIndex: state.mapping.translationColumnIndex!,
    //       }
    //     : undefined,
    // })
    //   .then(() => {
    //     toast('success', {
    //       title: 'Phrases imported',
    //       description: 'All phrases are now imported in your revision',
    //     })
    //     navigate(
    //       toProjectPhrases(workspaceKey, params.projectId!, state.revisionId),
    //     )
    //   })
    //   .catch(err => {
    //     console.log(err)
    //     toast('error', {
    //       title: 'Could not import phrases',
    //     })
    //   })
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
          path: '',
        },
        {
          label: 'Import from file',
          path: '',
        },
      ]}
    >
      <Head title={`Import phrases - ${project.name}`} />
      <Page subtitle={project.name} title="Import phrases">
        {step === 'form' && (
          <Form
            state={state}
            updateState={setState}
            projectId={params.projectId!}
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
