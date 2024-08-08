import { Icon, Modal, ModalContent, ModalRef } from 'design-system'
import { HTMLRenderResult } from 'email-renderer'
import { useRef } from 'react'
import { styled } from '../../../../theme'

interface Props {
  errors: HTMLRenderResult['errors']
}

const IconContainer = styled('button', {
  appearance: 'none',
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  paddingTop: 2,
  cursor: 'pointer',
})

const Code = styled('code', {
  display: 'block',
  backgroundColor: '$gray3',
  width: '100%',
  borderRadius: '$radius100',
  lineHeight: '$lineHeight200',
  padding: '$space100',
  fontSize: '$size80',
  marginBottom: '$space300',
  minHeight: 200,
  color: '$gray14',
  '& span': {
    display: 'block',
  },
})

export const CodeErrors = ({ errors }: Props) => {
  const modalRef = useRef<ModalRef>(null!)

  if (!errors) {
    return null
  }

  return (
    <>
      <IconContainer onClick={() => modalRef.current.open()}>
        <Icon
          src={errors.level === 'error' ? 'error' : 'warning'}
          size={16}
          color={errors.level === 'error' ? '$red200' : '$orange500'}
        />
      </IconContainer>

      <Modal ref={modalRef}>
        <ModalContent title="Code errors">
          <Code>
            {errors.messages.map((message, index) => (
              <span key={index}>{message}</span>
            ))}
          </Code>
        </ModalContent>
      </Modal>
    </>
  )
}
