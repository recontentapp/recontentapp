import { useQueryClient } from '@tanstack/react-query'
import { MinimalButton, Stack, toast } from 'design-system'
import { useMemo, useRef, useState } from 'react'
import { PanelGroup } from 'react-resizable-panels'
import { useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import {
  getGetEmailLayoutQueryKey,
  useGetEmailLayout,
  useGetProject,
  useUpdateEmailLayout,
} from '../../../../generated/reactQuery'
import { Paths } from '../../../../generated/typeDefinitions'
import { CodePanel } from '../../components/EmailEditor/CodePanel'
import { ContentPanel } from '../../components/EmailEditor/ContentPanel'
import { PreviewPanel } from '../../components/EmailEditor/PreviewPanel'
import { TOOLBAR_HEIGHT, Toolbar } from '../../components/EmailEditor/Toolbar'
import { useEmailLayoutPreview } from '../../components/EmailEditor/hooks'
import { Mode } from '../../components/EmailEditor/types'
import {
  UpdateEmailLayoutModal,
  UpdateEmailLayoutModalRef,
} from './components/UpdateEmailLayoutModal'

export const EmailLayoutEditor = () => {
  const queryClient = useQueryClient()
  const updateEmailLayoutModalRef = useRef<UpdateEmailLayoutModalRef>(null!)
  const [mode, setMode] = useState<Mode>('code')
  const params = useParams<'projectId' | 'layoutId'>()
  const { data: project } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })
  const { data: layout } = useGetEmailLayout({
    queryParams: {
      id: params.layoutId!,
    },
  })
  const { mutateAsync, isPending } = useUpdateEmailLayout({
    onSuccess: () => {
      if (!layout) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: getGetEmailLayoutQueryKey({
          queryParams: {
            id: layout.id,
          },
        }),
      })
    },
  })
  const languages =
    project?.languages.map(l => ({
      value: l.id,
      label: l.name,
    })) ?? []
  const initialVariables = useMemo(
    () =>
      layout?.variables.map(v => ({
        key: v.key,
        defaultContent: v.defaultContent,
        translations: v.translations.reduce<Record<string, string>>(
          (acc, val) => {
            acc[val.languageId] = val.content
            return acc
          },
          {},
        ),
      })) ?? [],
    [layout?.variables],
  )
  const {
    preview,
    value,
    setValue,
    variables,
    setVariables,
    onChangePreviewOption,
  } = useEmailLayoutPreview({
    initialValue: layout?.content ?? '',
    initialVariables,
  })

  const onSubmit = (
    partialValues?: Partial<Paths.UpdateEmailLayout.RequestBody>,
  ) => {
    if (!layout) {
      return
    }

    mutateAsync({
      body: {
        id: layout.id,
        key: partialValues?.key ?? layout.key,
        description: partialValues?.description ?? layout.description,
        content: value,
        variables,
      },
    })
      .then(() => {
        toast('success', {
          title: 'Email layout updated',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not update email layout',
        })
      })
  }

  if (!layout) {
    return <FullpageSpinner />
  }

  return (
    <Stack direction="column" flexWrap="nowrap">
      <Toolbar
        title={layout.key}
        mode={mode}
        updateMode={setMode}
        primaryAction={{
          label: 'Save email layout',
          onAction: onSubmit,
          isLoading: isPending,
        }}
      >
        <MinimalButton
          icon="settings"
          onAction={() => {
            updateEmailLayoutModalRef.current.open({
              key: layout.key,
              description: layout.description,
            })
          }}
        >
          Settings
        </MinimalButton>
      </Toolbar>

      <PanelGroup
        direction="horizontal"
        style={{ height: `calc(100vh - ${TOOLBAR_HEIGHT}px)` }}
      >
        {mode === 'code' && (
          <CodePanel
            value={value}
            setValue={setValue}
            variables={variables}
            setVariables={setVariables}
            errors={preview?.errors ?? null}
          />
        )}

        {mode === 'content' && (
          <ContentPanel
            variables={variables}
            setVariables={setVariables}
            languages={languages}
          />
        )}

        <PreviewPanel
          preview={preview}
          previewOptions={languages}
          onChangePreviewOption={onChangePreviewOption}
        />
      </PanelGroup>

      <UpdateEmailLayoutModal
        ref={updateEmailLayoutModalRef}
        onSubmit={onSubmit}
      />
    </Stack>
  )
}
