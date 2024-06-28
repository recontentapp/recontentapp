import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { Box, Metadata, Modal, ModalContent, ModalRef } from 'design-system'
import { Components } from '../../../../../generated/typeDefinitions'
import { formatRelative } from '../../../../../utils/dates'
import { useReferenceableAccounts } from '../../../hooks/referenceable'

export interface ShowPromptModalRef {
  open: (prompt: Components.Schemas.Prompt) => void
  close: () => void
}

interface ContentProps {
  prompt: Components.Schemas.Prompt
}

const Content: FC<ContentProps> = ({ prompt }) => {
  const { getName } = useReferenceableAccounts()

  return (
    <ModalContent title={prompt.name} contextTitle="AI prompt">
      <Box paddingBottom="$space100">
        <Metadata
          metadata={[
            {
              label: 'Name',
              value: prompt.name,
            },
            {
              label: 'Description',
              value: prompt.description ?? '',
            },
            {
              label: 'Tone',
              value: String(prompt.tone),
            },
            {
              label: 'Length',
              value: String(prompt.length),
            },
            {
              label: 'Custom instructions',
              value: prompt.customInstructions.join('\n'),
            },
            {
              label: 'Created at',
              value: formatRelative(new Date(prompt.createdAt)),
            },
            {
              label: 'Created by',
              value: getName(prompt.createdBy),
            },
          ]}
        />
      </Box>
    </ModalContent>
  )
}

export const ShowPromptModal = forwardRef<ShowPromptModalRef>((_props, ref) => {
  const [prompt, setPrompt] = useState<Components.Schemas.Prompt | null>(null)
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    open: prompt => {
      setPrompt(prompt)
      modalRef.current.open()
    },
    close: () => {
      modalRef.current.close()
    },
  }))

  return <Modal ref={modalRef}>{prompt && <Content prompt={prompt} />}</Modal>
})
