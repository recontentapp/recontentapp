import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import {
  Box,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  toast,
} from '../../../../components/primitives'
import { styled } from '../../../../theme'
import { Components } from '../../../../generated/typeDefinitions'
import {
  getListPhrasesQueryKey,
  useCreatePhrase,
} from '../../../../generated/reactQuery'
import { useQueryClient } from '@tanstack/react-query'

export interface CreatePhraseModalRef {
  open: (project: Components.Schemas.Project, revisionId: string) => void
  close: () => void
}

const Input = styled('input', {
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
})

interface ContentProps {
  project: Components.Schemas.Project
  revisionId: string
  onRequestClose: () => void
}

const Content: FC<ContentProps> = ({ project, revisionId, onRequestClose }) => {
  const [isCreatingMore, setIsCreatingMore] = useState(false)
  const { mutateAsync: createPhrase, isPending: isCreatingPhrase } =
    useCreatePhrase()
  const [key, setKey] = useState('')
  const inputRef = useRef<HTMLInputElement>(null!)

  const canBeSubmitted = key.length > 0

  const onSubmit = () => {
    createPhrase({
      body: {
        key,
        revisionId: revisionId,
      },
    })
      .then(() => {
        setKey('')
        inputRef.current.focus()
        toast('success', {
          title: 'Phrase created',
          description: 'You can start translating it',
        })

        if (!isCreatingMore) {
          onRequestClose()
        }
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create phrase',
        })
      })
  }

  return (
    <ModalContent
      asForm
      contextTitle={project.name}
      title="Create phrase"
      footer={{
        isCreatingMore,
        onToggleCreatingMore: value => setIsCreatingMore(value),
      }}
      primaryAction={{
        label: 'Save phrase',
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
        isLoading: isCreatingPhrase,
      }}
    >
      <Box width="100%" paddingBottom="$space200" minHeight={122}>
        <Stack width="100%" direction="column" spacing="$space80">
          <Stack width="100%" direction="column" spacing="$space80">
            <Input
              ref={inputRef}
              type="text"
              autoFocus
              placeholder="hello:key"
              value={key}
              onChange={event => setKey(event.target.value)}
            />
          </Stack>
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const CreatePhraseModal = forwardRef<CreatePhraseModalRef>(
  (_props, ref) => {
    const queryClient = useQueryClient()
    const [project, setProject] = useState<Components.Schemas.Project | null>(
      null,
    )
    const [revisionId, setRevisionId] = useState<string | undefined>(undefined)
    const modalRef = useRef<ModalRef>(null!)

    useImperativeHandle(ref, () => ({
      open: (project, revisionId) => {
        setProject(project)
        setRevisionId(revisionId)
        modalRef.current.open()
      },
      close: () => {
        if (revisionId) {
          queryClient.invalidateQueries({
            queryKey: getListPhrasesQueryKey({
              queryParams: { revisionId },
            }),
          })
        }
        modalRef.current.close()
      },
    }))

    return (
      <Modal ref={modalRef}>
        {project && revisionId && (
          <Content
            project={project}
            revisionId={revisionId}
            onRequestClose={() => {
              queryClient.invalidateQueries({
                queryKey: getListPhrasesQueryKey({
                  queryParams: { revisionId },
                }),
              })
              modalRef.current.close()
            }}
          />
        )}
      </Modal>
    )
  },
)
