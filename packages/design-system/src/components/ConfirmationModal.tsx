import { forwardRef, useImperativeHandle, useRef } from 'react'

import { Box } from './Box'
import { Modal, ModalContent, ModalRef } from './Modal'
import { Text } from './Text'

interface ConfirmationModalProps {
  title: string
  description: string
  variation: 'primary' | 'danger'
  isDisabled?: boolean
}

export interface ConfirmationModalRef {
  confirm: () => Promise<boolean>
}

export const ConfirmationModal = forwardRef<
  ConfirmationModalRef,
  ConfirmationModalProps
>(({ title, description, variation, isDisabled }, ref) => {
  const resolveRef = useRef<(value: boolean | PromiseLike<boolean>) => void>(
    null!,
  )
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    confirm: () => {
      modalRef.current.open()
      return new Promise(resolve => {
        resolveRef.current = resolve
      })
    },
  }))

  return (
    <Modal
      size="medium"
      ref={modalRef}
      onClose={() => resolveRef.current(false)}
    >
      <ModalContent
        title={title}
        primaryAction={{
          label: 'Confirm',
          variation,
          isDisabled,
          onAction: () => {
            modalRef.current.close()
            resolveRef.current(true)
          },
        }}
      >
        <Box paddingBottom="$space400" paddingRight={40}>
          <Text size="$size100" color="$gray11" lineHeight="$lineHeight300">
            {description}
          </Text>
        </Box>
      </ModalContent>
    </Modal>
  )
})
