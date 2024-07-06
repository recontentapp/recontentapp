import { FC, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  ConfirmationModal,
  ConfirmationModalRef,
  DropdownButton,
  Table,
  toast,
} from 'design-system'
import { useNavigate } from 'react-router-dom'
import {
  getListGlossariesQueryKey,
  useDeleteGlossary,
  useListGlossaries,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { formatRelative } from '../../../../../utils/dates'
import { useModals } from '../../../hooks/modals'
import { useReferenceableAccounts } from '../../../hooks/referenceable'

export const Glossaries: FC = () => {
  const queryClient = useQueryClient()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const navigate = useNavigate()
  const { openCreateGlossary } = useModals()
  const { id: workspaceId, key: workspaceKey } = useCurrentWorkspace()
  const { getName } = useReferenceableAccounts()
  const { isLoading, data } = useListGlossaries({
    queryParams: { workspaceId },
  })
  const { mutateAsync: deleteGlossary, isPending } = useDeleteGlossary({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListGlossariesQueryKey({ queryParams: { workspaceId } }),
      })
    },
  })

  const onRequestDelete = (glossaryId: string) => {
    if (isPending) {
      return
    }
    confirmationModalRef.current.confirm().then(res => {
      if (!res) {
        return
      }

      deleteGlossary({
        body: { glossaryId },
      })
        .then(() => {
          toast('success', { title: 'Glossary deleted' })
        })
        .catch(() => {
          toast('error', { title: 'Failed to delete glossary' })
        })
    })
  }

  return (
    <>
      <Table
        footerAddOnAction={openCreateGlossary}
        isLoading={isLoading}
        items={data?.items ?? []}
        primaryAction={{
          label: 'See glossary',
          icon: 'exit_to_app',
          onAction: item => {
            navigate(
              routes.glossary.url({
                pathParams: { workspaceKey, glossaryId: item.id },
              }),
            )
          },
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
                    label: 'See glossary',
                    icon: 'exit_to_app',
                    onSelect: () => {
                      navigate(
                        routes.glossary.url({
                          pathParams: { workspaceKey, glossaryId: item.id },
                        }),
                      )
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
        title="Are you sure about deleting this glossary?"
        description="Once deleted, a glossary can not be recovered."
        variation="danger"
        ref={confirmationModalRef}
      />
    </>
  )
}
