import { ReactNode } from 'react'

import { ColorValue, styled } from '../../theme'
import { Box } from './Box'
import { Icon } from './Icon'
import { Stack } from './Stack'
import { Text } from './Text'

type BannerVariant = 'info' | 'warning'

interface BannerProps {
  title?: string
  description: string | ReactNode
  variation: BannerVariant
  action?: {
    label: string
    onAction: () => void
  }
}

const Container = styled('div', {
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  paddingX: '$space100',
  paddingY: '$space80',
  variants: {
    variation: {
      info: {
        border: '1px solid $gray7',
        backgroundColor: '$white',
      },
      warning: {
        border: '1px solid $orange400',
        backgroundColor: '$orange100',
      },
    },
  },
})

const Button = styled('button', {
  display: 'inline',
  cursor: 'pointer',
  outline: 'none',
  fontWeight: 500,
  fontSize: '$size80',
  paddingY: '$space60',
  transition: 'all 0.2s ease-in-out',
  variants: {
    variation: {
      info: {
        color: '$gray10',
        '&:hover': {
          color: '$gray11',
        },
      },
      warning: {
        color: '$orange900',
        '&:hover': {
          color: '$orange800',
        },
      },
    },
  },
})

const iconColor: Record<BannerVariant, ColorValue> = {
  info: '$purple800',
  warning: '$orange600',
}

export const Banner = ({
  title,
  description,
  variation,
  action,
}: BannerProps) => {
  return (
    <Container role="status" variation={variation}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack
          direction="row"
          width="100%"
          spacing="$space60"
          flexWrap="nowrap"
          alignItems={title ? 'flex-start' : 'center'}
        >
          <Icon src="info" color={iconColor[variation]} size={20} />

          <Stack
            direction="row"
            flexGrow={1}
            justifyContent={action ? 'space-between' : 'start'}
          >
            <Stack
              direction="column"
              spacing="$space40"
              justifyContent="center"
            >
              {title && (
                <Box paddingTop="$space40">
                  <Text size="$size80" color="$gray14" variation="bold">
                    {title}
                  </Text>
                </Box>
              )}

              <Text size="$size80" color="$gray14" lineHeight="$lineHeight300">
                {description}
              </Text>
            </Stack>

            {action && (
              <Button variation={variation} onClick={action.onAction}>
                {action.label}
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}
