import { Position, Tooltip as ReachTooltip } from '@reach/tooltip'
import { FC, ReactElement } from 'react'

import { globalCss } from '../../theme'

interface TooltipProps {
  position: 'top' | 'right' | 'bottom' | 'left'
  title: string
  isDisabled?: boolean
  constrained?: boolean
  wrap?: boolean
  children: ReactElement
}

export const globalStyles = globalCss({
  '[data-reach-tooltip]': {
    zIndex: 100,
    lineHeight: 1.5,
    pointerEvents: 'none',
    position: 'absolute',
    backgroundColor: '$gray16 !important',
    borderRadius: '$radius100 !important',
    overflowWrap: 'break-word',
    boxShadow: '$shadow100',
    paddingY: '$space60 !important',
    paddingX: '$space80 !important',
    color: '$gray1 !important',
    fontSize: '$size80 !important',
    '&[data-constrained="true"]': {
      maxWidth: 200,
    },
  },
})

const positionFunc =
  (position: TooltipProps['position']): Position =>
  (triggerRect, tooltipRect) => {
    if (!triggerRect || !tooltipRect) {
      return {
        left: 0,
        top: 0,
      }
    }

    const gap = 4
    const triggerCenter = triggerRect.left + triggerRect.width / 2
    const maxLeft = window.innerWidth - tooltipRect.width - 2
    const left = triggerCenter - tooltipRect.width / 2

    switch (position) {
      case 'bottom':
        return {
          left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
          top: triggerRect.bottom + gap + window.scrollY,
        }
      case 'top':
        return {
          left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
          top: triggerRect.top - tooltipRect.height - gap + window.scrollY,
        }
      case 'right':
        return {
          left:
            Math.min(Math.max(2, triggerCenter + 18), maxLeft) + window.scrollX,
          top: triggerRect.top - gap + window.scrollY,
        }
      case 'left':
        return {
          left:
            Math.min(
              Math.max(2, triggerCenter - tooltipRect.width / 2),
              maxLeft,
            ) + window.scrollX,
          top: triggerRect.top - gap + window.scrollY,
        }
    }
  }

export const Tooltip: FC<TooltipProps> = ({
  isDisabled = false,
  wrap = false,
  constrained = true,
  title,
  position,
  children,
}) => {
  if (isDisabled) {
    return children
  }

  const content = wrap ? <div>{children}</div> : children

  return (
    <ReachTooltip
      position={positionFunc(position)}
      label={title}
      data-constrained={constrained}
    >
      {content}
    </ReachTooltip>
  )
}
