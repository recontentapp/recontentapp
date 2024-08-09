import { Button, MinimalButton, Stack, Text } from 'design-system'
import { ReactNode, useEffect, useState } from 'react'
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

interface CopyPasteProps {
  content: string
}

export const CopyPaste = ({ content }: CopyPasteProps) => {
  const [copied, setIsCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
    } catch {
      // Only work on secured origins
    }
  }

  useEffect(() => {
    if (!copied) {
      return () => {}
    }

    const timeout = setTimeout(() => {
      setIsCopied(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <MinimalButton size="small" icon="copy" onAction={onCopy}>
      {copied ? 'Copied!' : 'Copy HTML'}
    </MinimalButton>
  )
}

interface Props {
  title: string
  mode: Mode
  updateMode: (mode: Mode) => void
  children?: ReactNode
  htmlPreview?: string
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
  htmlPreview,
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
          {htmlPreview && <CopyPaste content={htmlPreview} />}

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
