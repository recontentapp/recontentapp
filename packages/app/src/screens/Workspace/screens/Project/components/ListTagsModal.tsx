import { FC, forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  DropdownButton,
  Modal,
  ModalContent,
  ModalRef,
  Table,
  Tag,
  Text,
  toast,
} from 'design-system'
import {
  getGetReferenceableTagsQueryKey,
  getListProjectTagsQueryKey,
  useDeleteProjectTag,
  useGetProject,
  useListProjectTags,
} from '../../../../../generated/reactQuery'
import { formatRelative } from '../../../../../utils/dates'

export interface ListTagsModalRef {
  open: () => void
}

interface ListTagsModalProps {
  projectId: string
  onRequestCreate: () => void
  onTagDeleted: () => void
}

interface ContentProps {
  projectId: string
  onRequestCreate: () => void
  onTagDeleted: () => void
}

const Content: FC<ContentProps> = ({
  projectId,
  onRequestCreate,
  onTagDeleted,
}) => {
  const queryClient = useQueryClient()
  const { data: tags } = useListProjectTags({ queryParams: { projectId } })
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { mutateAsync: deleteTag } = useDeleteProjectTag({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListProjectTagsQueryKey({ queryParams: { projectId } }),
      })
      queryClient.invalidateQueries({
        queryKey: getGetReferenceableTagsQueryKey({
          queryParams: { projectId },
        }),
      })
    },
  })

  const onRequestDelete = (id: string) => {
    deleteTag({ body: { tagId: id } })
      .then(() => {
        onTagDeleted()
        toast('success', {
          title: 'Tag deleted',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not delete tag',
        })
      })
  }

  return (
    <ModalContent contextTitle={project?.name} title="Tags">
      <Box paddingBottom="$space600">
        <Table
          items={tags?.items ?? []}
          footerAddOnAction={onRequestCreate}
          columns={[
            {
              key: 'id',
              isPrimary: true,
              headerCell: 'Tag',
              bodyCell: item => {
                return (
                  <Tag
                    size="small"
                    label={`${item.key}:${item.value}`}
                    color={item.color}
                  />
                )
              },
            },
            {
              key: 'description',
              headerCell: 'Description',
              bodyCell: item => (
                <Text
                  size="$size80"
                  color="$gray14"
                  lineHeight="$lineHeight200"
                >
                  {item.description ?? ''}
                </Text>
              ),
            },
            {
              key: 'createdAt',
              headerCell: 'Created At',
              bodyCell: item => (
                <Text
                  size="$size80"
                  color="$gray14"
                  lineHeight="$lineHeight200"
                >
                  {formatRelative(new Date(item.createdAt))}
                </Text>
              ),
            },
            {
              headerCell: 'Actions',
              key: 'actions',
              bodyCell: tag => (
                <DropdownButton
                  variation="minimal"
                  icon="more"
                  usePortal={false}
                  items={[
                    {
                      label: 'Delete',
                      icon: 'delete',
                      variation: 'danger',
                      onSelect: () => onRequestDelete(tag.id),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Box>
    </ModalContent>
  )
}

export const ListTagsModal = forwardRef<ListTagsModalRef, ListTagsModalProps>(
  ({ projectId, onRequestCreate, onTagDeleted }, ref) => {
    const modalRef = useRef<ModalRef>(null!)

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current.open()
      },
    }))

    const onContentRequestCreate = useCallback(() => {
      modalRef.current.close()
      onRequestCreate()
    }, [])

    return (
      <Modal ref={modalRef}>
        <Content
          projectId={projectId}
          onRequestCreate={onContentRequestCreate}
          onTagDeleted={onTagDeleted}
        />
      </Modal>
    )
  },
)
