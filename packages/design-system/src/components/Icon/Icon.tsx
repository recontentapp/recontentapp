import { FC } from 'react'
import { theme } from '../../theme'
import { iconMap } from './iconMap'
import { IconName } from './types'
import { Box } from '../Box'

interface IconProps {
  size: number
  color: `$${keyof typeof theme.colors}`
  src: IconName
}

export const Icon: FC<IconProps> = ({ src, size, color }) => {
  const Component = iconMap[src]
  const strippedColor = color.replace('$', '') as keyof typeof theme.colors

  return (
    <Box display="inline-flex">
      <Component size={size} color={theme.colors[strippedColor].value} />
    </Box>
  )
}

Icon.toString = () => '.icon'
