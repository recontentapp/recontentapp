import { FC, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  ConfirmationModal,
  ConfirmationModalRef,
  DropdownButton,
  Table,
  toast,
} from 'design-system'
import {
  getListPromptsQueryKey,
  useDeletePrompt,
  useListPrompts,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { formatRelative } from '../../../../../utils/dates'
import { useModals } from '../../../hooks/modals'
import { useReferenceableAccounts } from '../../../hooks/referenceable'

export const Prompts: FC = () => {
  const queryClient = useQueryClient()
  const { openUpsertPrompt } = useModals()
  const { id: workspaceId } = useCurrentWorkspace()
  const { getName } = useReferenceableAccounts()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const { isLoading, data } = useListPrompts({
    queryParams: { workspaceId },
  })
  const { mutateAsync: deletePrompt, isPending } = useDeletePrompt({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListPromptsQueryKey({ queryParams: { workspaceId } }),
      })
    },
  })

  const onRequestDelete = (promptId: string) => {
    if (isPending) {
      return
    }
    confirmationModalRef.current.confirm().then(res => {
      if (!res) {
        return
      }

      deletePrompt({
        body: { promptId },
      })
        .then(() => {
          toast('success', { title: 'AI Prompt deleted' })
        })
        .catch(() => {
          toast('error', { title: 'Failed to delete AI prompt' })
        })
    })
  }

  return (
    <>
      <Table
        footerAddOnAction={() => openUpsertPrompt(null)}
        isLoading={isLoading}
        items={data?.items ?? []}
        primaryAction={{
          label: 'Update prompt',
          icon: 'edit',
          onAction: item => openUpsertPrompt(item),
        }}
        columns={[
          {
            headerCell: 'Name',
            isPrimary: true,
            key: 'name',
            width: 300,
            bodyCell: locale => <p>{locale.name}</p>,
          },
          {
            headerCell: 'Created by',
            key: 'created_by',
            bodyCell: locale => getName(locale.createdBy),
          },
          {
            headerCell: 'Creation date',
            key: 'created_at',
            bodyCell: locale => formatRelative(new Date(locale.createdAt)),
          },
          {
            headerCell: 'Actions',
            key: 'actions',
            width: 100,
            bodyCell: item => (
              <DropdownButton
                variation="minimal"
                icon="more"
                usePortal={false}
                items={[
                  {
                    label: 'Update prompt',
                    icon: 'edit',
                    onSelect: () => {
                      openUpsertPrompt(item)
                    },
                  },
                  {
                    label: 'Delete',
                    icon: 'delete',
                    variation: 'danger',
                    onSelect: () => onRequestDelete(item.id),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <ConfirmationModal
        title="Are you sure about deleting this AI prompt?"
        description="Once deleted, an AI prompt can not be recovered."
        variation="danger"
        ref={confirmationModalRef}
      />
    </>
  )
}
