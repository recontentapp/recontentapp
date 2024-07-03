import { FC } from 'react'
import { Link } from 'react-router-dom'

import { Avatar, Heading, Stack } from 'design-system'
import { styled } from '../../../theme'

interface LinkCardProps {
  id: string
  title: string
  description: string
  to: string
  type?: string
}

interface ButtonCardProps {
  id: string
  title: string
  description: string
  onAction: () => void
  type?: string
}

type CardProps = LinkCardProps | ButtonCardProps

const Container = styled('div', {
  width: 200,
  'a, button': {
    width: '100%',
    display: 'flex',
    cursor: 'pointer',
    appearance: 'none',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    height: 194,
    outline: 'none',
    border: '1px solid $gray7',
    boxShadow: '$shadow100',
    padding: '$space100',
    borderRadius: '$radius200',
    transition: 'all 0.2s ease-in-out',
    '&:hover, &:focus': {
      backgroundColor: '$gray2',
      boxShadow: '$shadow200',
    },
  },
})

const Description = styled('p', {
  fontSize: '$size60',
  lineHeight: '$lineHeight200',
  color: '$gray11',
  textAlign: 'left',
  display: '-webkit-box',
  overflow: 'hidden',
  lineClamp: 2,
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical',
})

export const Card: FC<CardProps> = ({
  title,
  id,
  description,
  type,
  ...rest
}) => {
  const InnerContainer = 'to' in rest ? Link : 'button'
  const props = 'to' in rest ? { to: rest.to } : { onClick: rest.onAction }

  return (
    <Container>
      {/* @ts-expect-error */}
      <InnerContainer {...props}>
        <Stack width="100%" direction="column" spacing="$space80">
          <Stack direction="column" spacing="$space60">
            <Avatar name={id} variation="marble" size={20} />
            <Heading textAlign="left" renderAs="h2" size="$size100">
              {title}
            </Heading>
          </Stack>

          {type && <span>{type}</span>}

          <Description>{description}</Description>
        </Stack>
      </InnerContainer>
    </Container>
  )
}
