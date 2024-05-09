import {
  FC,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Text,
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  Tag,
} from '../../../../../components/primitives'
import {
  getListPhrasesQueryKey,
  useBatchApplyProjectTag,
  useGetProject,
  useListProjectTags,
} from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'
import { useQueryClient } from '@tanstack/react-query'

export interface ApplyTagsModalRef {
  open: (phraseIds: string[]) => void
}

interface ApplyTagsModalProps {
  projectId: string
  onApply?: () => void
}

interface ContentProps {
  projectId: string
  phraseIds: string[]
  onApply: () => void
}

const Content: FC<ContentProps> = ({ projectId, phraseIds, onApply }) => {
  const queryClient = useQueryClient()
  const [tagsToApply, setTagsToApply] = useState<Components.Schemas.Tag[]>([])
  const { data: tags } = useListProjectTags({ queryParams: { projectId } })
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { mutateAsync, isPending } = useBatchApplyProjectTag({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListPhrasesQueryKey(),
      })
      onApply()
    },
  })

  const options = useMemo(() => {
    return (tags?.items ?? [])
      .filter(tag => {
        return !tagsToApply.some(t => t.id === tag.id)
      })
      .map(tag => ({
        label: `${tag.key}:${tag.value}`,
        value: tag.id,
      }))
  }, [tags, tagsToApply])

  return (
    <ModalContent
      asForm
      contextTitle={project?.name}
      title="Apply tags"
      primaryAction={{
        label: 'Save changes',
        onAction: () =>
          mutateAsync({
            body: {
              recordIds: phraseIds,
              recordType: 'phrase',
              tagIds: tagsToApply.map(tag => tag.id),
            },
          }),
        isLoading: isPending,
      }}
    >
      <Stack
        direction="column"
        spacing="$space100"
        paddingTop="$space100"
        paddingBottom="$space200"
      >
        <Text color="$gray14" size="$size80">
          Tags will be applied to selected phrases. Existing tags will be
          replaced.
        </Text>

        <SelectField
          label="Tag"
          hideLabel
          placeholder="Select a tag..."
          value={undefined}
          onChange={value => {
            if (!value) {
              return
            }

            const tag = tags?.items.find(tag => tag.id === value.value)
            if (!tag) {
              return
            }

            setTagsToApply(tagsToApply => [...tagsToApply, tag])
          }}
          options={options}
        />

        <Stack direction="row" spacing="$space60">
          {tagsToApply.map(tag => (
            <Tag
              key={tag.id}
              color={tag.color}
              label={`${tag.key}:${tag.value}`}
              onClose={() => {
                setTagsToApply(tagsToApply =>
                  tagsToApply.filter(t => t.id !== tag.id),
                )
              }}
            />
          ))}
        </Stack>
      </Stack>
    </ModalContent>
  )
}

export const ApplyTagsModal = forwardRef<
  ApplyTagsModalRef,
  ApplyTagsModalProps
>(({ projectId, onApply }, ref) => {
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
        phraseIds={phraseIds}
        onApply={() => {
          modalRef.current.close()
          onApply?.()
        }}
      />
    </Modal>
  )
})
