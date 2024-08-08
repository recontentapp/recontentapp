import { Button, Stack, Text } from 'design-system'
import { ReactNode } from 'react'
import { styled } from '../../../../theme'
import { Switch } from './Switch'
import { Mode } from './types'

export const TOOLBAR_HEIGHT = 50

const Container = styled('header', {
  height: TOOLBAR_HEIGHT,
  flexShrink: 0,
  borderBottom: '1px solid $gray7',
  paddingX: '$space100',
  display: 'flex',
  alignItems: 'center',
})

interface Props {
  title: string
  mode: Mode
  updateMode: (mode: Mode) => void
  children?: ReactNode
  primaryAction: {
    label: string
    isLoading?: boolean
    isDisabled?: boolean
    onAction: () => void
  }
}

export const Toolbar = ({
  title,
  children,
  mode,
  updateMode,
  primaryAction,
}: Props) => {
  return (
    <Container>
      <Stack
        width="100%"
        alignItems="center"
        direction="row"
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center" spacing="$space60">
          <Text size="$size100" variation="semiBold" color="$gray14">
            {title}
          </Text>

          {children}
        </Stack>

        <Stack direction="row" alignItems="center" spacing="$space100">
          <Switch value={mode} onChange={updateMode} />

          <Button
            variation="primary"
            isDisabled={primaryAction.isDisabled}
            isLoading={primaryAction.isLoading}
            onAction={primaryAction.onAction}
          >
            {primaryAction.label}
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
