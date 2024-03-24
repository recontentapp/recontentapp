import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import {
  DEFAULT_REVISION,
  FileFormat,
  Project,
  fileFormatLabels,
  useGenerateExportLink,
  useListRevisionsInProject,
} from '../../../../../api'

import {
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  Switch,
  toast,
} from '../../../../../components/primitives'

interface OpenProps {
  project: Project
}

interface ContentProps extends OpenProps {
  onRedirect: () => void
}

export interface ExportToFileModalRef {
  open: (props: OpenProps) => void
}

interface State {
  projectId: string
  revisionId: string
  languageId?: string
  fileFormat: FileFormat
  exportAllLanguages: boolean
  includeEmptyTranslations: boolean
}

const Content: FC<ContentProps> = ({ project, onRedirect }) => {
  const { isLoading, mutateAsync: generateExportLink } = useGenerateExportLink()
  const { data: revisions = [] } = useListRevisionsInProject(project.id, true)
  const [state, setState] = useState<State>({
    projectId: project.id,
    revisionId: DEFAULT_REVISION,
    languageId: project.languages.at(0)?.id,
    fileFormat: 'json',
    exportAllLanguages: false,
    includeEmptyTranslations: true,
  })

  const isValid = state.projectId && state.revisionId && state.fileFormat

  const onSubmit = async () => {
    if (!isValid) {
      return
    }

    const url = await generateExportLink({
      project_id: state.projectId,
      revision_id: state.revisionId,
      language_id: state.exportAllLanguages ? undefined : state.languageId,
      file_format: state.fileFormat,
      include_empty_translations: state.includeEmptyTranslations,
    }).catch(() => {
      toast('error', { title: 'Could not generate export link' })
      return null
    })

    if (!url) {
      return
    }

    window.open(url, '_blank')
    onRedirect()
    toast('success', { title: 'Export link successfully generated' })
  }

  return (
    <ModalContent
      asForm
      title="Export to file"
      contextTitle={project.name}
      primaryAction={{
        label: 'Generate & download',
        onAction: onSubmit,
        isDisabled: !isValid,
        isLoading,
      }}
    >
      <Stack direction="column" spacing="$space100" paddingBottom="$space300">
        <SelectField
          label="File format"
          options={Object.entries(fileFormatLabels).map(([value, label]) => ({
            label,
            value,
          }))}
          value={state.fileFormat}
          onChange={option => {
            if (!option) {
              return
            }
            setState(state => ({
              ...state,
              fileFormat: option.value as FileFormat,
              exportAllLanguages: false,
            }))
          }}
        />

        {['csv', 'excel'].includes(state.fileFormat) && (
          <Switch
            label="Export all languages in the same file?"
            value={state.exportAllLanguages}
            onChange={exportAllLanguages => {
              setState(state => ({
                ...state,
                exportAllLanguages,
              }))
            }}
          />
        )}

        {!state.exportAllLanguages && (
          <SelectField
            label="Language"
            placeholder="Choose a language"
            options={project.languages.map(language => ({
              label: language.name,
              value: language.id,
            }))}
            value={state.languageId}
            onChange={option =>
              setState(state => ({ ...state, languageId: option?.value }))
            }
          />
        )}

        <SelectField
          label="Revision"
          options={[
            {
              label: 'Master',
              value: DEFAULT_REVISION,
            },
            ...revisions.map(revision => ({
              label: revision.name,
              value: revision.id,
            })),
          ]}
          value={state.revisionId}
          onChange={option => {
            if (!option) {
              return
            }
            setState(state => ({ ...state, revisionId: option.value }))
          }}
        />
      </Stack>
    </ModalContent>
  )
}

export const ExportToFileModal = forwardRef<ExportToFileModalRef>((_, ref) => {
  const modalRef = useRef<ModalRef>(null!)
  const [props, setProps] = useState<OpenProps | null>(null)

  useImperativeHandle(ref, () => ({
    open: (props: OpenProps) => {
      setProps(props)
      modalRef.current.open()
    },
  }))

  return (
    <Modal ref={modalRef}>
      {props && (
        <Content {...props} onRedirect={() => modalRef.current.close()} />
      )}
    </Modal>
  )
})
