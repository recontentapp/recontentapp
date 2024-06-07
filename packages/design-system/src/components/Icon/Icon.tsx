import { FC } from 'react'
import { theme } from '../../theme'
import { Box } from '../Box'
import { iconMap } from './iconMap'
import { IconName } from './types'

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
      <Component
        width={size}
        height={size}
        fill={theme.colors[strippedColor]}
      />
    </Box>
  )
}

Icon.toString = () => '.icon'
