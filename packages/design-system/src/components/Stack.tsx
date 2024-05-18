import { CSSProperties } from '@stitches/react'
import { FC, ReactNode, useMemo } from 'react'

import { SpaceValue } from '../theme'
import { styled } from '../stitches'

interface StackProps
  extends Pick<
    CSSProperties,
    | 'width'
    | 'maxWidth'
    | 'alignItems'
    | 'flexGrow'
    | 'flexWrap'
    | 'justifyContent'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
    | 'marginBottom'
    | 'marginLeft'
    | 'marginRight'
    | 'marginTop'
    | 'height'
  > {
  children: ReactNode
  className?: string
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  renderAs?: keyof JSX.IntrinsicElements
  spacing?: SpaceValue
  paddingX?: SpaceValue
  paddingY?: SpaceValue
}

export const Stack: FC<StackProps> = ({
  renderAs = 'div',
  direction,
  className,
  spacing = '$space0',
  children,
  ...props
}) => {
  const Component = useMemo(
    () =>
      styled(renderAs, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing,
        variants: {
          direction: {
            row: {
              flexDirection: 'row',
            },
            column: {
              flexDirection: 'column',
            },
            'row-reverse': {
              flexDirection: 'row-reverse',
            },
            'column-reverse': {
              flexDirection: 'column-reverse',
            },
          },
        },
      }),
    [renderAs, spacing],
  )

  return (
    <Component direction={direction} css={props} className={className}>
      {children}
    </Component>
  )
}
