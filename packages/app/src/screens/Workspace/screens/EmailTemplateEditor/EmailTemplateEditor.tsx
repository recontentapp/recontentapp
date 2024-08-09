import { useQueryClient } from '@tanstack/react-query'
import { MinimalButton, Stack, toast } from 'design-system'
import { useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { PanelGroup } from 'react-resizable-panels'
import { useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import {
  getGetEmailTemplateQueryKey,
  useGetEmailLayout,
  useGetEmailTemplate,
  useGetProject,
  useUpdateEmailTemplate,
} from '../../../../generated/reactQuery'
import { Paths } from '../../../../generated/typeDefinitions'
import { CodePanel } from '../../components/EmailEditor/CodePanel'
import { ContentPanel } from '../../components/EmailEditor/ContentPanel'
import { PreviewPanel } from '../../components/EmailEditor/PreviewPanel'
import { TOOLBAR_HEIGHT, Toolbar } from '../../components/EmailEditor/Toolbar'
import { useEmailTemplatePreview } from '../../components/EmailEditor/hooks'
import { Mode } from '../../components/EmailEditor/types'
import {
  UpdateEmailTemplateModal,
  UpdateEmailTemplateModalRef,
} from './components/UpdateEmailTemplateModal'

export const EmailTemplateEditor = () => {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('code')
  const params = useParams<'projectId' | 'templateId'>()
  const updateEmailTemplateModalRef = useRef<UpdateEmailTemplateModalRef>(null!)
  const { data: project } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })
  const { data: template } = useGetEmailTemplate({
    queryParams: {
      id: params.templateId!,
    },
  })
  const { data: layout } = useGetEmailLayout(
    {
      queryParams: {
        id: String(template?.layoutId),
      },
    },
    {
      enabled: !!template?.layoutId,
    },
  )
  const { mutateAsync, isPending } = useUpdateEmailTemplate({
    onSuccess: () => {
      if (!template) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: getGetEmailTemplateQueryKey({
          queryParams: {
            id: template.id,
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
      template?.variables.map(v => ({
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
    [template?.variables],
  )
  const initialLayoutVariables = useMemo(
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
  } = useEmailTemplatePreview({
    layout: layout?.content,
    layoutVariables: initialLayoutVariables,
    initialValue: template?.content ?? '',
    initialVariables,
  })

  const onSubmit = (
    partialValues?: Partial<Paths.UpdateEmailTemplate.RequestBody>,
  ) => {
    if (!template) {
      return
    }

    mutateAsync({
      body: {
        id: template.id,
        layoutId: partialValues?.layoutId ?? template.layoutId,
        key: partialValues?.key ?? template.key,
        description: partialValues?.description ?? template.description,
        content: value,
        variables,
      },
    })
      .then(() => {
        toast('success', {
          title: 'Email template updated',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not update email template',
        })
      })
  }

  useHotkeys(
    ['metaKey+s', 'ctrl+s'],
    () => {
      onSubmit()
    },
    {
      preventDefault: true,
    },
    [onSubmit],
  )

  if (!template) {
    return <FullpageSpinner />
  }

  return (
    <Stack direction="column" flexWrap="nowrap">
      <Toolbar
        title={template.key}
        mode={mode}
        updateMode={setMode}
        htmlPreview={preview?.html ?? ''}
        primaryAction={{
          label: 'Save email template',
          onAction: onSubmit,
          isLoading: isPending,
        }}
      >
        <MinimalButton
          icon="settings"
          onAction={() => {
            updateEmailTemplateModalRef.current.open({
              key: template.key,
              description: template.description,
              layoutId: template.layoutId,
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
            layoutVariables={initialLayoutVariables}
            onRequestSubmit={onSubmit}
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

      <UpdateEmailTemplateModal
        projectId={template.projectId}
        ref={updateEmailTemplateModalRef}
        onSubmit={onSubmit}
      />
    </Stack>
  )
}
