import { theme } from '../theme'

type ProgressCircleVariation = 'sm' | 'md'

interface ProgressCircleProps {
  variation: ProgressCircleVariation
  /**
   * Value between `0` & `1`
   */
  value: number
}

const variations: Record<
  ProgressCircleVariation,
  { size: number; width: number }
> = {
  sm: {
    size: 24,
    width: 4,
  },
  md: {
    size: 40,
    width: 6,
  },
}

export const ProgressCircle = ({ variation, value }: ProgressCircleProps) => {
  const size = variations[variation].size
  const strokeWidth = variations[variation].width

  const center = size / 2
  const radius = center - strokeWidth
  const progress = 1 - value
  const arcLength = 2 * Math.PI * radius
  const arcOffset = arcLength * progress

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        strokeWidth={strokeWidth}
        stroke={theme.colors.gray6.value}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        strokeDasharray={arcLength}
        strokeDashoffset={arcOffset}
        stroke={theme.colors.purple700.value}
      />
    </svg>
  )
}
