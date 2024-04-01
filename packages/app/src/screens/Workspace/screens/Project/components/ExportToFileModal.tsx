import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  toast,
} from '../../../../../components/primitives'
import { Components } from '../../../../../generated/typeDefinitions'
import { fileFormatLabels } from '../../../../../utils/files'
import { useGeneratePhrasesExportLink } from '../../../../../generated/reactQuery'

interface OpenProps {
  project: Components.Schemas.Project
}

interface ContentProps extends OpenProps {
  onRedirect: () => void
}

export interface ExportToFileModalRef {
  open: (props: OpenProps) => void
}

interface State {
  projectId: string
  languageId?: string
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
}

const Content: FC<ContentProps> = ({ project, onRedirect }) => {
  const { isPending, mutateAsync: generateExportLink } =
    useGeneratePhrasesExportLink()
  const [state, setState] = useState<State>({
    projectId: project.id,
    languageId: project.languages.at(0)?.id,
    fileFormat: 'json',
    includeEmptyTranslations: true,
  })

  const onSubmit = async () => {
    if (!state.languageId || isPending) {
      return
    }

    const response = await generateExportLink({
      body: {
        revisionId: project.masterRevisionId,
        languageId: state.languageId,
        fileFormat: state.fileFormat,
        includeEmptyTranslations: state.includeEmptyTranslations,
      },
    }).catch(() => {
      toast('error', { title: 'Could not generate export link' })
      return null
    })

    if (!response?.link) {
      return
    }

    window.open(response.link, '_blank')
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
        isLoading: isPending,
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
              fileFormat: option.value as Components.Schemas.FileFormat,
              exportAllLanguages: false,
            }))
          }}
        />

        <SelectField
          label="Language"
          placeholder="Choose a language"
          options={project.languages.map(language => ({
            label: language.name,
            value: language.id,
          }))}
          value={state.languageId}
          onChange={option => {
            if (!option) {
              return
            }
            setState(state => ({ ...state, languageId: option.value }))
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
