import { CSSProperties } from '@stitches/react'
import { FC, ReactNode, useMemo } from 'react'

import { ColorValue, SpaceValue } from '../theme'
import { styled } from '../stitches'

type Value = SpaceValue | number | string | '0 auto'

interface BoxProps
  extends Pick<
    CSSProperties,
    | 'position'
    | 'zIndex'
    | 'top'
    | 'bottom'
    | 'right'
    | 'left'
    | 'minHeight'
    | 'borderRadius'
    | 'height'
    | 'width'
    | 'display'
    | 'minWidth'
    | 'maxWidth'
    | 'alignItems'
    | 'justifyContent'
    | 'overflowY'
    | 'overflowX'
    | 'overflow'
    | 'flexGrow'
    | 'flexBasis'
  > {
  children?: ReactNode
  className?: string
  renderAs?: keyof JSX.IntrinsicElements
  padding?: Value
  margin?: Value
  paddingX?: Value
  paddingY?: Value
  marginX?: Value
  marginY?: Value
  paddingTop?: Value
  paddingRight?: Value
  paddingBottom?: Value
  paddingLeft?: Value
  marginTop?: Value
  marginRight?: Value
  marginBottom?: Value
  marginLeft?: Value
  backgroundColor?: ColorValue
  testId?: string
}

export const Box: FC<BoxProps> = ({
  className,
  renderAs = 'div',
  children,
  testId,
  ...props
}) => {
  const Component = useMemo(
    () =>
      styled(renderAs, {
        display: 'flex',
      }),
    [renderAs],
  )

  return (
    <Component css={props} className={className} data-testid={testId}>
      {children}
    </Component>
  )
}
