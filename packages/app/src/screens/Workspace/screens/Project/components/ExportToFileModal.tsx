import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Icon,
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  toast,
} from 'design-system'
import {
  useGeneratePhrasesExportLink,
  useListProjectTags,
} from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'
import { styled } from '../../../../../theme'
import { fileFormatLabels } from '../../../../../utils/files'

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
  containsTagIds: string[]
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
}

const SelectedOption = styled('div', {
  display: 'inline-block',
  backgroundColor: '$gray3',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  border: '1px solid $gray6',
  color: '$gray14',
  fontSize: '$size80',
  fontWeight: 500,
  paddingLeft: '$space60',
  paddingRight: '$space40',
  paddingY: '$space40',
})

const CloseButton = styled('button', {
  cursor: 'pointer',
  width: 18,
  height: 18,
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$gray6',
  },
  '&:active': {
    backgroundColor: '$gray7',
  },
})

const Content: FC<ContentProps> = ({ project, onRedirect }) => {
  const { data: tagsData } = useListProjectTags({
    queryParams: { projectId: project.id },
  })
  const { isPending, mutateAsync: generateExportLink } =
    useGeneratePhrasesExportLink()
  const [state, setState] = useState<State>({
    projectId: project.id,
    languageId: project.languages.at(0)?.id,
    fileFormat: 'json',
    includeEmptyTranslations: true,
    containsTagIds: [],
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
        containsTagIds: state.containsTagIds,
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

        <Stack direction="column" spacing="$space60">
          <SelectField
            width="100%"
            label="Tags"
            placeholder="Choose tags..."
            options={(tagsData?.items ?? [])
              .filter(item => {
                return !state.containsTagIds.includes(item.id)
              })
              .map(tag => ({
                label: `${tag.key}:${tag.value}`,
                value: tag.id,
              }))}
            onChange={value => {
              if (!value) {
                return
              }
              setState(state => ({
                ...state,
                containsTagIds: [...state.containsTagIds, value.value],
              }))
            }}
            value={undefined}
          />

          {state.containsTagIds.length > 0 && (
            <Stack direction="row" spacing="$space60">
              {state.containsTagIds.map(val => {
                const matchingOption = (tagsData?.items ?? []).find(
                  option => option.id === val,
                )

                if (!matchingOption) {
                  return
                }

                return (
                  <SelectedOption key={matchingOption.value}>
                    <Stack
                      renderAs="span"
                      direction="row"
                      spacing="$space40"
                      alignItems="center"
                    >
                      {matchingOption.key}:{matchingOption.value}
                      <CloseButton
                        onClick={() => {
                          setState(state => ({
                            ...state,
                            containsTagIds: state.containsTagIds.filter(
                              tagId => tagId !== val,
                            ),
                          }))
                        }}
                        aria-label="Close"
                        type="button"
                      >
                        <Icon src="close" color="$gray10" size={16} />
                      </CloseButton>
                    </Stack>
                  </SelectedOption>
                )
              })}
            </Stack>
          )}
        </Stack>
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
