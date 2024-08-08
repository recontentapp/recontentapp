import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { Modal, ModalContent, ModalRef, Stack, TextField } from 'design-system'
import { Paths } from '../../../../../generated/typeDefinitions'

type PartialLayout = Pick<
  Paths.UpdateEmailLayout.RequestBody,
  'key' | 'description'
>

export interface UpdateEmailLayoutModalRef {
  open: (template: PartialLayout) => void
}

interface UpdateEmailLayoutModalProps {
  onSubmit: (state: State) => void
}

interface ContentProps extends UpdateEmailLayoutModalProps {
  layout: PartialLayout
}

interface State {
  key: string
  description: string | null
}

const Content: FC<ContentProps> = ({ onSubmit, layout }) => {
  const [state, setState] = useState({
    key: layout.key,
    description: layout.description,
  })

  return (
    <ModalContent
      asForm
      title="Edit email template"
      contextTitle={layout.key}
      primaryAction={{
        label: 'Save changes',
        onAction: () =>
          onSubmit({
            key: state.key,
            description: state.description || null,
          }),
      }}
    >
      <Stack direction="column" spacing="$space100" paddingBottom="$space300">
        <TextField
          width="100%"
          value={state.key}
          autoFocus
          label="Key"
          onChange={value => {
            setState(state => ({ ...state, key: value }))
          }}
        />

        <TextField
          width="100%"
          value={state.description ?? ''}
          label="Description"
          isOptional
          onChange={value => {
            setState(state => ({ ...state, description: value }))
          }}
        />
      </Stack>
    </ModalContent>
  )
}

export const UpdateEmailLayoutModal = forwardRef<
  UpdateEmailLayoutModalRef,
  UpdateEmailLayoutModalProps
>(({ onSubmit }, ref) => {
  const modalRef = useRef<ModalRef>(null!)
  const [layout, setLayout] = useState<PartialLayout | null>(null)

  useImperativeHandle(ref, () => ({
    open: (props: PartialLayout) => {
      setLayout(props)
      modalRef.current.open()
    },
  }))

  return (
    <Modal ref={modalRef}>
      {layout && (
        <Content
          layout={layout}
          onSubmit={values => {
            onSubmit(values)
            modalRef.current.close()
          }}
        />
      )}
    </Modal>
  )
})
