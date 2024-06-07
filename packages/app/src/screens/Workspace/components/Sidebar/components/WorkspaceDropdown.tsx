import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Avatar,
  Box,
  Icon,
  IconName,
  Stack,
  Text,
  Tooltip,
} from 'design-system'
import { useAuth, useCurrentUser } from '../../../../../auth'
import { Logo } from '../../../../../components/Logo'
import {
  useCurrentWorkspace,
  useLooseCurrentWorkspace,
} from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { styled } from '../../../../../theme'

const WorkspaceButton = styled('div', {
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  paddingX: '$space60',
  paddingY: '$space40',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$purple800',
  },
  '&:active': {
    backgroundColor: '$purple700',
  },
})

const UserButton = styled('div', {
  cursor: 'pointer',
  outline: 'none',
  paddingX: '$space60',
  paddingY: '$space40',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$purple800',
  },
  '&:active': {
    backgroundColor: '$purple700',
  },
})

interface LabelWithIconProps {
  icon: IconName
  label: string
}

const LabelWithIcon: FC<LabelWithIconProps> = ({ icon, label }) => {
  return (
    <Stack
      direction="row"
      flexWrap="nowrap"
      alignItems="center"
      spacing="$space40"
    >
      <Box marginLeft={-3}>
        <Icon src={icon} size={16} color="$gray14" />
      </Box>
      <span>{label}</span>
    </Stack>
  )
}

export const WorkspaceDropdown: FC = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { firstName, lastName } = useCurrentUser()
  const { availableAccounts, updateCurrentAccount } = useLooseCurrentWorkspace()
  const { name: workspaceName, key: workspaceKey } = useCurrentWorkspace()

  const otherAccounts = useMemo(() => {
    return availableAccounts.filter(
      account => account.workspace.key !== workspaceKey,
    )
  }, [workspaceKey, availableAccounts])

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Menu>
        <MenuButton>
          <WorkspaceButton>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing="$space60"
            >
              <Logo variation="white" size={20} logoOnly />

              <Text size="$size80" variation="bold" color="$white">
                {workspaceName}
              </Text>
            </Stack>
          </WorkspaceButton>
        </MenuButton>
        <MenuList>
          {otherAccounts.map(account => (
            <MenuItem
              key={account.workspace.key}
              onSelect={() => updateCurrentAccount(account)}
            >
              <LabelWithIcon
                icon="chevron_right"
                label={`Go to ${account.workspace.name}`}
              />
            </MenuItem>
          ))}
          <MenuItem
            onSelect={() =>
              navigate(
                routes.createAnotherWorkspace.url({
                  pathParams: {
                    workspaceKey,
                  },
                }),
              )
            }
          >
            <LabelWithIcon
              icon="add_circle"
              label="Create or join a workspace"
            />
          </MenuItem>
        </MenuList>
      </Menu>

      <Menu>
        <MenuButton>
          <Tooltip title="User settings" position="right">
            <UserButton>
              <Avatar
                size={20}
                name={`${firstName} ${lastName}` ?? 'You'}
                variation="initials"
              />
            </UserButton>
          </Tooltip>
        </MenuButton>
        <MenuList>
          <MenuItem
            onSelect={() =>
              navigate(
                routes.userSettings.url({ pathParams: { workspaceKey } }),
              )
            }
          >
            <LabelWithIcon icon="settings" label="User settings" />
          </MenuItem>
          <MenuItem onSelect={signOut}>
            <LabelWithIcon icon="exit_to_app" label="Log out" />
          </MenuItem>
        </MenuList>
      </Menu>
    </Stack>
  )
}
