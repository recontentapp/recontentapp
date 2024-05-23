import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { Box, Modal, ModalContent, ModalRef, Stack, toast } from 'design-system'
import { styled } from '../../../../../theme'
import { useSendFeedback } from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

export interface FeedbacksModalRef {
  open: () => void
  close: () => void
}

const Input = styled('textarea', {
  display: 'block',
  width: '100%',
  fontSize: '$size200',
  border: 'none',
  paddingX: 0,
  paddingY: '$space100',
  background: 'transparent',
  marginTop: -16,
  outline: 'none',
  color: '$gray14',
  fontWeight: 500,
  height: '30vh',
  resize: 'none',
})

interface ContentProps {
  onRequestClose: () => void
}

const Content = ({ onRequestClose }: ContentProps) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null!)
  const canBeSubmitted = message.length > 0
  const { mutateAsync, isPending } = useSendFeedback()
  const { id: workspaceId } = useCurrentWorkspace()

  const onSubmit = () => {
    mutateAsync({
      body: {
        message,
        workspaceId,
        referrer: window.location.href,
      },
    })
      .then(() => {
        toast('success', {
          title: 'Feedback sent',
          description: 'Thank you for helping improve Recontent.app',
        })
        onRequestClose()
      })
      .catch(() => {
        toast('error', {
          title: 'Could not send feedback',
        })
      })
  }

  return (
    <ModalContent
      asForm
      title="Send feedback"
      primaryAction={{
        label: 'Send feedback',
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
        isLoading: isPending,
      }}
    >
      <Box width="100%" paddingBottom="$space200" minHeight={122}>
        <Stack width="100%" direction="column" spacing="$space80">
          <Stack width="100%" direction="column" spacing="$space80">
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Give us feedback on how we can improve Recontent.app"
              value={message}
              onChange={event => setMessage(event.target.value)}
            />
          </Stack>
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const FeedbacksModal = forwardRef<FeedbacksModalRef>((_props, ref) => {
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current.open()
    },
    close: () => {
      modalRef.current.close()
    },
  }))

  return (
    <Modal ref={modalRef}>
      <Content
        onRequestClose={() => {
          modalRef.current.close()
        }}
      />
    </Modal>
  )
})
