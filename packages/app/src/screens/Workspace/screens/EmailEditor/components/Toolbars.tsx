import { styled } from '../../../../../theme'

export const SubToolbar = styled('header', {
  height: 40,
  flexShrink: 0,
  borderBottom: '1px solid $gray7',
  paddingX: '$space100',
  display: 'flex',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  backgroundColor: '$white',
  zIndex: 2,
})

export const TOOLBAR_HEIGHT = 50

export const Toolbar = styled('header', {
  height: TOOLBAR_HEIGHT,
  flexShrink: 0,
  borderBottom: '1px solid $gray7',
  paddingX: '$space100',
  display: 'flex',
  alignItems: 'center',
})
