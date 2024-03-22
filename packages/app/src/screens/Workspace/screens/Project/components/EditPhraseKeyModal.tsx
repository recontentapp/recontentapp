import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Box,
  Modal,
  ModalContent,
  ModalRef,
  TextField,
  toast,
} from '../../../../../components/primitives'
import { Components } from '../../../../../generated/typeDefinitions'
import { useUpdatePhraseKey } from '../../../../../generated/reactQuery'

interface OpenProps {
  phrase: Components.Schemas.PhraseItem
}

export interface EditPhraseKeyModalRef {
  open: (props: OpenProps) => void
}

interface ContentProps extends OpenProps {
  onUpdate: () => void
}

const Content: FC<ContentProps> = ({ onUpdate, phrase }) => {
  const [key, setKey] = useState(phrase.key)
  const { mutateAsync, isPending } = useUpdatePhraseKey()

  const onSubmit = () => {
    mutateAsync({
      body: {
        phraseId: phrase.id,
        key,
      },
    })
      .then(() => {
        toast('success', {
          title: 'Phrase updated',
        })
        onUpdate()
      })
      .catch(() => {
        toast('error', {
          title: 'Could not update phrase',
          description: 'Key might be already used',
        })
      })
  }

  return (
    <ModalContent
      asForm
      title="Edit key"
      contextTitle={phrase.key}
      primaryAction={{
        label: 'Save changes',
        onAction: onSubmit,
        isLoading: isPending,
      }}
    >
      <Box paddingBottom="$space300">
        <TextField
          width="100%"
          value={key}
          autoFocus
          label="Key"
          onChange={setKey}
        />
      </Box>
    </ModalContent>
  )
}

export const EditPhraseKeyModal = forwardRef<EditPhraseKeyModalRef>(
  (_, ref) => {
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
          <Content {...props} onUpdate={() => modalRef.current.close()} />
        )}
      </Modal>
    )
  },
)
