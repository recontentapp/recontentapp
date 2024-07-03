import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
} from 'design-system'
import {
  useBatchAutoTranslatePhrases,
  useGetProject,
} from '../../../../../../../generated/reactQuery'

export interface BatchTranslateModalRef {
  open: (phraseIds: string[]) => void
}

interface BatchTranslateModalProps {
  projectId: string
  revisionId: string
  onApply?: () => void
}

interface ContentProps {
  projectId: string
  revisionId: string
  phraseIds: string[]
  onApply: () => void
}

const Content: FC<ContentProps> = ({
  projectId,
  revisionId,
  phraseIds,
  onApply,
}) => {
  const [sourceLanguageId, setSourceLanguageId] = useState<string | undefined>()
  const [targetLanguageId, setTargetLanguageId] = useState<string | undefined>()
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { mutateAsync, isPending } = useBatchAutoTranslatePhrases({
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: getListPhrasesQueryKey(),
      // })
      onApply()
    },
  })

  const onSubmit = () => {
    if (!sourceLanguageId || !targetLanguageId) {
      return
    }

    mutateAsync({
      body: {
        revisionId,
        phraseIds,
        sourceLanguageId,
        targetLanguageId,
      },
    })
  }

  const languages =
    project?.languages.map(l => ({
      label: l.name,
      value: l.id,
    })) ?? []

  return (
    <ModalContent
      asForm
      contextTitle={project?.name}
      title="Autotranslate"
      primaryAction={{
        label: `Autotranslate ${phraseIds.length} phrases`,
        onAction: onSubmit,
        isLoading: isPending,
      }}
    >
      <Stack
        direction="column"
        spacing="$space100"
        paddingTop="$space100"
        paddingBottom="$space300"
      >
        <SelectField
          label="Source language"
          placeholder="Select a source language..."
          value={sourceLanguageId}
          onChange={value => {
            if (!value) {
              return
            }

            setSourceLanguageId(value.value)
          }}
          options={languages}
        />

        <SelectField
          label="Target language"
          placeholder="Select a target language..."
          value={targetLanguageId}
          onChange={value => {
            if (!value) {
              return
            }

            setTargetLanguageId(value.value)
          }}
          options={languages}
        />
      </Stack>
    </ModalContent>
  )
}

export const BatchTranslateModal = forwardRef<
  BatchTranslateModalRef,
  BatchTranslateModalProps
>(({ projectId, revisionId, onApply }, ref) => {
  const [phraseIds, setPhraseIds] = useState<string[]>([])
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    open: phraseIds => {
      setPhraseIds(phraseIds)
      modalRef.current.open()
    },
  }))

  return (
    <Modal ref={modalRef}>
      <Content
        projectId={projectId}
        revisionId={revisionId}
        phraseIds={phraseIds}
        onApply={() => {
          modalRef.current.close()
          onApply?.()
        }}
      />
    </Modal>
  )
})
