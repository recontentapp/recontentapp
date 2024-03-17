import { FC } from 'react'

import { Heading, Stack, Table } from '../../../../../components/primitives'
import { formatRelative } from '../../../../../utils/dates'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { InvitationForm } from '../components/InvitationForm'
import { useListWorkspaceAccounts } from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

export const Members: FC = () => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { getName } = useReferenceableAccounts()
  const { isPending: areMembersLoading, data: members } =
    useListWorkspaceAccounts({
      queryParams: {
        workspaceId,
        type: 'human',
      },
    })
  const areInvitationsLoading = false
  const invitations: any[] = []

  return (
    <Stack width="100%" direction="column" spacing="$space400">
      <Stack direction="column" spacing="$space80">
        <Heading renderAs="h2" size="$size100">
          Members
        </Heading>
        <Table
          items={members?.items ?? []}
          isLoading={areMembersLoading}
          columns={[
            {
              headerCell: 'Name',
              key: 'name',
              width: 300,
              bodyCell: member => (
                <p>
                  {member.user?.firstName} {member.user?.lastName}
                </p>
              ),
            },
            {
              headerCell: 'Email address',
              key: 'email',
              bodyCell: member => member.user?.email,
            },
            {
              headerCell: 'Role',
              key: 'role',
              width: 100,
              bodyCell: member => <p>{member.role}</p>,
            },
            {
              headerCell: 'Joined on',
              key: 'created_at',
              bodyCell: member => formatRelative(new Date(member.createdAt)),
            },
          ]}
        />
      </Stack>

      <Stack direction="column" spacing="$space80">
        <Heading renderAs="h2" size="$size100">
          Pending invitations
        </Heading>
        <Table
          footerAdd={({ requestClose }) => (
            <InvitationForm onClose={requestClose} />
          )}
          items={invitations ?? []}
          isLoading={areInvitationsLoading}
          columns={[
            {
              headerCell: 'Invited email address',
              key: 'for',
              width: 300,
              bodyCell: invitation => invitation.email_address,
            },
            {
              headerCell: 'Expiration date',
              key: 'expired_at',
              bodyCell: invitation => (
                <p>{formatRelative(new Date(invitation.expired_at))}</p>
              ),
            },
            {
              headerCell: 'Invited by',
              key: 'created_by',
              bodyCell: invitation => getName(invitation.created_by),
            },
            {
              headerCell: 'Creation date',
              key: 'created_at',
              bodyCell: invitation =>
                formatRelative(new Date(invitation.created_at)),
            },
          ]}
        />
      </Stack>
    </Stack>
  )
}
