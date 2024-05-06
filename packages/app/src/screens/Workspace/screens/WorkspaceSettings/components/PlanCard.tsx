import { FC } from 'react'

import {
  Box,
  Button,
  ButtonVariation,
  Heading,
  Icon,
  Stack,
  Text,
} from '../../../../../components/primitives'
import { styled } from '../../../../../theme'

export interface PlanCardProps {
  title: string
  price: string
  description: string
  isActive?: boolean
  items: string[]
  primaryAction: {
    label: string
    variation?: Extract<ButtonVariation, 'primary' | 'danger'>
    isDisabled?: boolean
    isLoading?: boolean
    onAction: () => void
  }
  secondaryAction?: {
    label: string
    variation?: Extract<ButtonVariation, 'primary' | 'danger'>
    isDisabled?: boolean
    isLoading?: boolean
    onAction: () => void
  }
}

const Container = styled('div', {
  display: 'inline-flex',
  position: 'relative',
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  paddingY: '$space200',
  paddingX: '$space100',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  '&::after': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    content: '',
    display: 'block',
    width: '100%',
    height: 3,
    backgroundColor: '$purple800',
    borderTopRightRadius: '$radius200',
    borderTopLeftRadius: '$radius200',
  },
})

export const PlanCard: FC<PlanCardProps> = ({
  title,
  price,
  description,
  items,
  primaryAction,
  secondaryAction,
  isActive,
}) => {
  return (
    <Container>
      <Stack direction="row" spacing="$space60">
        <Stack direction="column" spacing="$space300">
          <Stack direction="column" spacing="$space200">
            <Stack direction="column" spacing="$space100">
              <Stack direction="column" spacing="$space20">
                <Heading
                  size="$size100"
                  renderAs="span"
                  maxWidth={200}
                  withEllipsis
                >
                  {title}
                </Heading>

                <Stack direction="row" alignItems="flex-end" spacing="$space40">
                  <Heading
                    size="$size400"
                    lineHeight="$lineHeight100"
                    renderAs="span"
                    maxWidth={200}
                    withEllipsis
                  >
                    {price}
                  </Heading>

                  <Box paddingBottom="$space40">
                    <Text size="$size60" color="$gray11">
                      per month
                    </Text>
                  </Box>
                </Stack>
              </Stack>

              <Text
                size="$size80"
                textWrap="balance"
                maxWidth={260}
                color="$gray11"
                lineHeight="$lineHeight200"
              >
                {description}
              </Text>
            </Stack>

            <Stack direction="column" renderAs="ul" spacing="$space60">
              {items.map(item => (
                <Stack
                  direction="row"
                  spacing="$space40"
                  alignItems="center"
                  renderAs="li"
                  key={item}
                >
                  <Icon src="check_circle" size={16} color="$purple800" />
                  <Text size="$size80" color="$gray11">
                    {item}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {isActive ? (
            <Stack
              direction="row"
              marginTop={6}
              spacing="$space40"
              alignItems="center"
            >
              <Icon src="check_circle" size={20} color="$green100" />

              <Text size="$size80" variation="bold" color="$gray14">
                Current plan
              </Text>
            </Stack>
          ) : (
            <Stack direction="column" spacing="$space60">
              <div>
                <Button variation="primary" {...primaryAction}>
                  {primaryAction.label}
                </Button>
              </div>

              <div>
                {secondaryAction && (
                  <Button variation="secondary" {...secondaryAction}>
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}
