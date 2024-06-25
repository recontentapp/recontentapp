import { FC } from 'react'

import { DropdownButton, Table } from 'design-system'
import { useNavigate } from 'react-router-dom'
import { useListPrompts } from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { formatRelative } from '../../../../../utils/dates'
import { useModals } from '../../../hooks/modals'
import { useReferenceableAccounts } from '../../../hooks/referenceable'

export const Prompts: FC = () => {
  const navigate = useNavigate()
  const { openUpsertPrompt } = useModals()
  const { id: workspaceId, key: workspaceKey } = useCurrentWorkspace()
  const { getName } = useReferenceableAccounts()
  const { isLoading, data } = useListPrompts({
    queryParams: { workspaceId },
  })

  return (
    <Table
      footerAddOnAction={() => openUpsertPrompt(null)}
      isLoading={isLoading}
      items={data?.items ?? []}
      primaryAction={{
        label: 'Update prompt',
        icon: 'open_in_new',
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
              ]}
            />
          ),
        },
      ]}
    />
  )
}
