import {
  Box,
  ConfirmationModal,
  ConfirmationModalRef,
  Metadata,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
} from 'design-system'
import {
  getListFigmaFilesQueryKey,
  useDeleteFigmaFile,
  useListFigmaFiles,
} from '../../../../../generated/reactQuery'
import { ImportCard } from './ImportCard'
import { Components } from '../../../../../generated/typeDefinitions'
import { useRef, useState } from 'react'
import { formatRelative } from '../../../../../utils/dates'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { useQueryClient } from '@tanstack/react-query'

interface FigmaFilesListProps {
  projectId: string
}

export const FigmaFilesList = ({ projectId }: FigmaFilesListProps) => {
  const queryClient = useQueryClient()
  const modalRef = useRef<ModalRef>(null)
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)
  const [currentFile, setCurrentFile] =
    useState<Components.Schemas.FigmaFile | null>(null)
  const { mutateAsync: deleteFile, isPending } = useDeleteFigmaFile({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListFigmaFilesQueryKey({
          queryParams: {
            projectId,
          },
        }),
      })
    },
  })
  const { data } = useListFigmaFiles({
    queryParams: {
      projectId,
    },
  })
  const { getName } = useReferenceableAccounts()

  const onRequestDelete = () => {
    if (!currentFile) {
      return
    }

    confirmationModalRef.current?.confirm().then(res => {
      if (!res) {
        return
      }

      deleteFile({
        body: {
          figmaFileId: currentFile.id,
        },
      }).then(() => {
        modalRef.current?.close()
      })
    })
  }

  if (!data || data?.items.length === 0) {
    return null
  }

  return (
    <Stack direction="row" flexWrap="wrap" spacing="$space80">
      {data.items.map(item => (
        <ImportCard
          key={item.id}
          variation="neutral"
          icon="figma"
          onAction={() => {
            setCurrentFile(item)
            modalRef.current?.open()
          }}
          description=""
          title={item.name}
        />
      ))}

      <Modal size="medium" ref={modalRef}>
        {currentFile && (
          <ModalContent
            title={currentFile.name}
            secondaryAction={{
              label: 'Delete',
              icon: 'delete',
              isLoading: isPending,
              onAction: onRequestDelete,
            }}
            primaryAction={{
              label: 'Open Figma file',
              icon: 'open_in_new',
              onAction: () => {
                window.open(currentFile.url, '_blank')
              },
            }}
          >
            <Box paddingBottom="$space100">
              <Metadata
                metadata={[
                  {
                    label: 'Name',
                    value: currentFile.name,
                  },
                  {
                    label: 'Created at',
                    value: formatRelative(new Date(currentFile.createdAt)),
                  },
                  {
                    label: 'Created by',
                    value: getName(currentFile.createdBy),
                  },
                ]}
              />
            </Box>
          </ModalContent>
        )}
      </Modal>

      <ConfirmationModal
        ref={confirmationModalRef}
        title="Are you sure about deleting this destination"
        description="Once deleted, a destination can not be recovered."
        variation="danger"
      />
    </Stack>
  )
}
