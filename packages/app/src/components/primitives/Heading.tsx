import { CSSProperties } from '@stitches/react'
import { FC, ReactNode, useMemo } from 'react'

import { ColorValue, FontSizeValue, styled } from '../../theme'

interface HeadingProps
  extends Pick<CSSProperties, 'maxWidth' | 'lineHeight' | 'textAlign'> {
  children: ReactNode
  size: FontSizeValue
  color?: ColorValue
  renderAs: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p'
  withEllipsis?: boolean
}

export const Heading: FC<HeadingProps> = ({
  size,
  withEllipsis,
  color = '$gray14',
  renderAs,
  children,
  ...props
}) => {
  const Component = useMemo(() => {
    return styled(renderAs, {
      display: 'inline-block',
      fontWeight: 700,
      fontSize: size,
      lineHeight: '$lineHeight200',
      color,
      ...(withEllipsis && {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
    })
  }, [size, withEllipsis, renderAs, color])

  return <Component css={props}>{children}</Component>
}
