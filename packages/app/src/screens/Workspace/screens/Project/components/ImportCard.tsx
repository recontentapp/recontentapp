import { FigmaIcon, Heading, Icon, IconName, Stack, Text } from 'design-system'
import { FC } from 'react'
import { styled } from '../../../../../theme'

export interface ImportCardProps {
  title: string
  description?: string
  icon: IconName | 'figma'
  variation: 'secondary' | 'neutral'
  onAction: () => void
}

const Container = styled('div', {
  position: 'relative',
  minWidth: 140,
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  cursor: 'pointer',
  transition: 'all 0.1s ease-in-out',
  paddingY: '$space80',
  paddingX: '$space80',
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
    borderTopRightRadius: '$radius200',
    borderTopLeftRadius: '$radius200',
  },
  '&:hover': {
    backgroundColor: '$gray2',
  },
  variants: {
    variation: {
      secondary: {
        '&::after': {
          backgroundColor: '$blue900',
        },
      },
      neutral: {
        '&::after': {
          backgroundColor: '$gray14',
        },
      },
    },
  },
})

export const ImportCard: FC<ImportCardProps> = ({
  title,
  description,
  variation,
  icon,
  onAction,
}) => {
  return (
    <Container
      role="button"
      tabIndex={0}
      onClick={onAction}
      variation={variation}
    >
      <Stack direction="row" spacing="$space60" alignItems="flex-start">
        {icon === 'figma' ? (
          <FigmaIcon width={11} />
        ) : (
          <Icon src={icon} size={20} color="$purple800" />
        )}

        <Stack direction="column" spacing="$space20">
          <Heading size="$size80" renderAs="span" maxWidth={200} withEllipsis>
            {title}
          </Heading>

          {description && (
            <Text size="$size60" color="$gray11">
              {description}
            </Text>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}
