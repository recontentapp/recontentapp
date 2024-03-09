import { FC } from 'react'

import { styled } from '../../../../theme'
import { AvatarProps } from '../types'
import { getNumber, getRandomColor } from '../utilities'

const getInitials = (value?: string): string => {
  if (!value) {
    return ''
  }

  const parts = Array.isArray(value)
    ? value
    : value
        // remove non letters/numbers
        .replace(/[^a-zA-Z0-9 ]+/g, '')
        .split(' ')

  return parts
    .map(part => (typeof part === 'string' ? part.charAt(0).toUpperCase() : ''))
    .filter(
      (letter, i, arr) => i === 0 || (arr.length > 0 && i === arr.length - 1),
    )
    .join('')
}

const generateColor = (
  name: AvatarProps['name'],
  colors: AvatarProps['colors'] = ['#C271B4', '#F0AB3D', '#92A1C6'],
) => {
  const numFromName = getNumber(name)
  const range = colors && colors.length

  return getRandomColor(numFromName, colors, range)
}

const Container = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    squared: {
      true: {
        borderRadius: 0,
      },
      false: {
        borderRadius: '50%',
      },
    },
  },
})

const Text = styled('span', {
  color: '$text14',
  fontSize: 10,
  fontWeight: 500,
  lineHeight: 1,
})

export const Initials: FC<AvatarProps> = props => {
  const color = generateColor(props.name, props.colors)
  const initials = getInitials(props.name)

  return (
    <Container
      squared={props.squared ?? false}
      css={{
        width: props.size,
        height: props.size,
        backgroundColor: color,
      }}
    >
      <Text>{initials}</Text>
    </Container>
  )
}
