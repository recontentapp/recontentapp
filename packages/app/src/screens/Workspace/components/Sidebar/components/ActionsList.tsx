import { FC } from 'react'

import { Box, Icon, IconName, Stack, Text } from 'design-system'
import { styled } from '../../../../../theme'

export interface ActionButtonProps {
  icon: IconName
  name: string
  hightlighted?: boolean
  count?: number
  onAction: () => void
}

interface ActionsListProps {
  items: ActionButtonProps[]
}

const ActionButtonContainer = styled('button', {
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'calc(100% + 16px)',
  marginLeft: -8,
  marginRight: -8,
  paddingLeft: 12,
  paddingRight: '$space60',
  paddingY: 5,
  marginY: '$space20',
  borderRadius: '$radius200',
  transition: 'all 0.2s ease-in-out',
  variants: {
    active: {
      true: {
        backgroundColor: '$purple800',
      },
    },
  },
  '&:hover,&:focus': {
    backgroundColor: '$purple800',
  },
  '&:active': {
    backgroundColor: '$purple700',
  },
})

const Badge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$red100',
  color: '$gray1',
  borderRadius: '$radius400',
  paddingX: '$space40',
  height: 17,
  fontWeight: 500,
  minWidth: 22,
  fontSize: '$size60',
})

export const ActionButton: FC<ActionButtonProps> = ({
  onAction,
  icon,
  name,
  count = 0,
  hightlighted,
}) => {
  return (
    <ActionButtonContainer onClick={onAction}>
      <Stack direction="row" alignItems="center" spacing="$space40">
        <Icon
          src={icon}
          size={16}
          color={hightlighted ? '$purple100' : '$purple400'}
        />
        <Text
          color={hightlighted ? '$purple100' : '$purple400'}
          size="$size80"
          textAlign="left"
          variation={hightlighted ? 'bold' : undefined}
        >
          {name}
        </Text>
      </Stack>

      <Box>{count > 0 && <Badge>{count > 99 ? '99+' : count}</Badge>}</Box>
    </ActionButtonContainer>
  )
}

export const ActionsList: FC<ActionsListProps> = ({ items }) => {
  if (items.length === 0) {
    return null
  }

  return (
    <Box width="100%" paddingX="$space60">
      <Stack width="100%" renderAs="ul" direction="column" spacing="$space0">
        {items.map((item, index) => (
          <li key={index}>
            <ActionButton {...item} />
          </li>
        ))}
      </Stack>
    </Box>
  )
}
