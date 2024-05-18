import { FC, ReactNode } from 'react'

import { styled } from '../../../theme'
import { Box } from '../../Box'
import { Button, ButtonVariation } from '../../Button'
import { Form } from '../../Form'
import { Icon, IconName } from '../../Icon'
import { Stack } from '../../Stack'
import { Switch } from '../../Switch'
import { Tooltip } from '../../Tooltip'

interface FooterMoveUpDown {
  moveUp: {
    isDisabled?: boolean
    onAction: () => void
  }
  moveDown: {
    isDisabled?: boolean
    onAction: () => void
  }
}

interface FooterToggle {
  isToggled: boolean
  toggleLabel: string
  onToggle: (value: boolean) => void
}

interface ContentProps {
  contextTitle?: string
  title: string
  description?: string
  children: ReactNode
  asForm?: boolean
  footer?: FooterMoveUpDown | FooterToggle
  contextAction?: {
    icon: IconName
    label: string
    onAction: () => void
  }
  primaryAction?: {
    label: string
    variation?: Extract<ButtonVariation, 'primary' | 'danger'>
    isDisabled?: boolean
    isLoading?: boolean
    onAction: () => void
  }
}

const Header = styled('header', {
  borderTopRightRadius: '$radius200',
  borderTopLeftRadius: '$radius200',
  paddingLeft: '$space200',
  paddingRight: 54,
  paddingY: '$space100',
})

const ContextTitle = styled('span', {
  backgroundColor: '$gray3',
  color: '$gray11',
  fontSize: '$size60',
  borderRadius: '$radius100',
  lineHeight: 1,
  paddingX: '$space60',
  paddingY: '$space40',
  maxWidth: '60%',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
})

const ContextTitleChevron = styled('span', {
  color: '$gray11',
  fontSize: '$size80',
})

const Title = styled('h2', {
  fontSize: '$size80',
  fontWeight: 600,
  color: '$gray14',
})

const Footer = styled('footer', {
  paddingX: '$space200',
  paddingY: '$space80',
  variants: {
    withBorder: {
      true: {
        borderTop: '1px solid $gray6',
      },
    },
  },
})

const Main = styled('div', {
  flexGrow: 1,
  overflowY: 'auto',
  paddingX: '$space200',
})

const Inner = styled('div', {
  display: 'flex',
  flexDirection: 'column',
})

const ContextButton = styled('button', {
  cursor: 'pointer',
  width: 28,
  height: 28,
  marginTop: -6,
  marginRight: -7,
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$gray3',
  },
  '&:active': {
    backgroundColor: '$gray6',
  },
})

export const Content: FC<ContentProps> = ({
  asForm,
  primaryAction,
  contextAction,
  contextTitle,
  title,
  children,
  footer,
}) => {
  const Container = asForm && primaryAction ? Form : Box
  const containerProps =
    asForm && primaryAction ? { onSubmit: primaryAction.onAction } : {}

  return (
    // @ts-expect-error
    <Container {...containerProps}>
      <Inner className="modal__inner">
        <Header>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack
              flexGrow={1}
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing="$space60"
            >
              {contextTitle && (
                <>
                  <Tooltip
                    constrained={false}
                    title={contextTitle}
                    position="top"
                  >
                    <ContextTitle>{contextTitle}</ContextTitle>
                  </Tooltip>
                  <ContextTitleChevron>›</ContextTitleChevron>
                </>
              )}
              <Title>{title}</Title>
            </Stack>

            <Stack
              paddingTop="$space20"
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              {contextAction && (
                <Tooltip title={contextAction.label} position="bottom">
                  <ContextButton
                    type="button"
                    onClick={contextAction.onAction}
                    aria-label={contextAction.label}
                  >
                    <Icon src={contextAction.icon} color="$gray10" size={16} />
                  </ContextButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Header>

        <Main>{children}</Main>

        <Footer withBorder={!!footer || !!primaryAction}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing="$space100"
          >
            <Box>
              {footer && 'moveUp' in footer && (
                <Stack direction="row" alignItems="center" spacing="$space40">
                  <Button
                    variation="secondary"
                    icon="keyboard_arrow_up"
                    isDisabled={footer.moveUp.isDisabled}
                    onAction={footer.moveUp.onAction}
                  />
                  <Button
                    variation="secondary"
                    icon="keyboard_arrow_down"
                    isDisabled={footer.moveDown.isDisabled}
                    onAction={footer.moveDown.onAction}
                  />
                </Stack>
              )}
            </Box>

            <Stack direction="row" spacing="$space100">
              {footer && 'toggleLabel' in footer && (
                <Switch
                  value={footer.isToggled}
                  onChange={value => footer.onToggle(value)}
                  label={footer.toggleLabel}
                />
              )}

              {primaryAction && (
                <Button
                  type={asForm ? 'submit' : 'button'}
                  variation={primaryAction.variation ?? 'primary'}
                  onAction={asForm ? () => {} : primaryAction.onAction}
                  isDisabled={primaryAction.isDisabled}
                  isLoading={primaryAction.isLoading}
                >
                  {primaryAction.label}
                </Button>
              )}
            </Stack>
          </Stack>
        </Footer>
      </Inner>
    </Container>
  )
}
