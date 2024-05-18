import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { FC } from 'react'

import { globalCss, keyframes } from '../theme'
import { Box } from './Box'
import { Icon, IconName } from './Icon'
import { Spinner } from './Spinner'
import { Stack } from './Stack'

interface DropdownButtonItem {
  icon?: IconName
  label: string
  variation?: 'danger'
  onSelect: () => void
}

interface DropdownButtonProps {
  variation: 'minimal' | 'primary' | 'secondary'
  icon: IconName
  items: DropdownButtonItem[]
  label?: string
  isLoading?: boolean
  usePortal?: boolean
}

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateY(4px)' },
  '100%': { opacity: 1, transform: 'translateY(0px)' },
})

export const globalStyles = globalCss({
  '.dropdown-button__button': {
    position: 'relative',
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-flex',
    paddingX: '$space60',
    paddingY: '$space40',
    fontSize: '$size80',
    fontWeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '$radius100',
    transition: 'all 0.2s ease-in-out',
    ' & .loading-container': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  '.dropdown-button__button--loading': {
    cursor: 'progress',
    '& .content': {
      opacity: 0,
    },
  },
  '.dropdown-button__button--primary': {
    border: '1px solid $indigo80',
    borderRadius: '$radius200',
    backgroundColor: '$blue800',
    boxShadow:
      'rgb(15 15 15 / 10%) 0px 0px 0px 1px inset, rgb(15 15 15 / 10%) 0px 1px 2px',
    color: '$gray1',
    '&:hover,&:focus': {
      backgroundColor: '$blue800',
    },
    '&:active': {
      backgroundColor: '$blue700',
    },
    '&[aria-expanded="true"]': {
      backgroundColor: '$blue800',
    },
  },
  '.dropdown-button__button--secondary': {
    backgroundColor: '$gray1',
    borderRadius: '$radius200',
    boxShadow: '$shadow200',
    border: '1px solid $gray6',
    color: '$gray14',
    '&:hover,&:focus': {
      backgroundColor: '$gray2',
    },
    '&:active': {
      backgroundColor: '$gray3',
    },
    '&[aria-expanded="true"]': {
      backgroundColor: '$gray2',
    },
  },
  '.dropdown-button__button--minimal': {
    '&[aria-expanded="true"]': {
      backgroundColor: '$gray2',
    },
    '&:hover,&:focus': {
      backgroundColor: '$gray2',
    },
    '&:active': {
      backgroundColor: '$gray3',
    },
  },
  '[data-reach-menu]': {
    position: 'relative',
  },
  '[data-reach-menu-popover]': {
    zIndex: 100,
    display: 'block',
    position: 'absolute',
  },
  '[data-reach-menu-popover][hidden]': {
    display: 'none',
  },
  '[data-reach-menu-list],[data-reach-menu-items]': {
    display: 'block',
    whiteSpace: 'nowrap',
    outline: 'none',
    backgroundColor: '$white',
    border: '1px solid $gray7',
    borderRadius: '$radius200',
    marginTop: '$space60',
    boxShadow: '$shadow300',
    animation: `${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  '[data-reach-menu-item]': {
    display: 'block',
    userSelect: 'none',
    fontSize: '$size80',
    fontWeight: 500,
    color: '$gray14',
    borderRadius: '$radius200',
    paddingX: '$space80',
    paddingY: '$space80',
    cursor: 'pointer',
    margin: 0,
  },
  '[data-reach-menu-item][data-selected]': {
    backgroundColor: '$gray3',
    outline: 'none',
  },
  '[data-reach-menu-item][aria-disabled]': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})

export const DropdownButton: FC<DropdownButtonProps> = ({
  variation,
  isLoading,
  icon,
  label,
  items,
  usePortal = true,
}) => {
  return (
    <Menu>
      <MenuButton
        disabled={isLoading}
        className={`dropdown-button__button dropdown-button__button--${variation} ${
          isLoading && 'dropdown-button__button--loading'
        }`}
      >
        {isLoading && (
          <Box className="loading-container">
            <Spinner
              color={variation === 'secondary' ? '$gray11' : '$gray1'}
              size={16}
            />
          </Box>
        )}
        <Stack
          className="content"
          direction="row"
          alignItems="center"
          spacing="$space40"
        >
          <Icon
            src={icon}
            size={20}
            color={variation === 'primary' ? '$white' : '$gray10'}
          />
          {label && <span>{label}</span>}
        </Stack>
      </MenuButton>

      <MenuList portal={usePortal}>
        {items.map((item, index) => (
          <MenuItem key={index} onSelect={item.onSelect}>
            <Stack
              direction="row"
              flexWrap="nowrap"
              alignItems="center"
              spacing="$space40"
            >
              {item.icon && (
                <Box marginLeft={-3}>
                  <Icon
                    src={item.icon}
                    size={16}
                    color={
                      item.variation === 'danger'
                        ? '$red200'
                        : variation === 'primary'
                          ? '$gray1'
                          : '$gray14'
                    }
                  />
                </Box>
              )}
              <span>{item.label}</span>
            </Stack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
