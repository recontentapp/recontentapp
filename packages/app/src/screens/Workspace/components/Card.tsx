import { FC } from 'react'
import { Link } from 'react-router-dom'

import { Avatar, Heading, Stack, Text } from '../../../components/primitives'
import { styled } from '../../../theme'
import { formatRelative } from '../../../utils/dates'

interface CardProps {
  id: string
  title: string
  date: Date
  to: string
  type?: string
}

const Container = styled('div', {
  width: 200,
  a: {
    display: 'flex',
    flexDirection: 'column',
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

export const Card: FC<CardProps> = ({ title, id, date, to, type }) => {
  return (
    <Container>
      <Link to={to}>
        <Stack direction="column" spacing="$space80">
          <Stack direction="column" spacing="$space60">
            <Avatar name={id} variation="marble" size={20} />
            <Heading renderAs="h2" size="$size100">
              {title}
            </Heading>
          </Stack>

          {type && <span>{type}</span>}

          <Text size="$size60" color="$gray11" lineHeight="$lineHeight200">
            Updated {formatRelative(new Date(date))}
          </Text>
        </Stack>
      </Link>
    </Container>
  )
}
