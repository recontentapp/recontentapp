import { FC, forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import {
  Box,
  DropdownButton,
  Modal,
  ModalContent,
  ModalRef,
  Table,
  Tag,
  toast,
} from '../../../../../components/primitives'
import { formatRelative } from '../../../../../utils/dates'
import {
  useDeleteProjectTag,
  useGetProject,
  useListProjectTags,
} from '../../../../../generated/reactQuery'

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
  const { data: tags } = useListProjectTags({ queryParams: { projectId } })
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { mutateAsync: deleteTag } = useDeleteProjectTag()

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
    <ModalContent asForm contextTitle={project?.name} title="Tags">
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
              bodyCell: item => item.description ?? '',
            },
            {
              key: 'createdAt',
              headerCell: 'Created At',
              bodyCell: item => formatRelative(new Date(item.createdAt)),
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
