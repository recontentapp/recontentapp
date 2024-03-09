import { CSSProperties } from '@stitches/react'
import { FC, ReactNode, useMemo } from 'react'

import { ColorValue, FontSizeValue, styled } from '../../theme'

interface TextProps
  extends Pick<CSSProperties, 'maxWidth' | 'lineHeight' | 'textAlign'> {
  children: ReactNode
  size: FontSizeValue
  variation?: 'caps' | 'bold' | 'semiBold'
  color: ColorValue
  renderAs?: 'p' | 'span'
}

export const Text: FC<TextProps> = ({
  size,
  renderAs = 'p',
  color,
  variation,
  children,
  ...props
}) => {
  const Component = useMemo(() => {
    return styled(renderAs, {
      fontWeight: 400,
      fontSize: size,
      color,
      variants: {
        variation: {
          caps: {
            textTransform: 'uppercase',
          },
          semiBold: {
            fontWeight: 500,
          },
          bold: {
            fontWeight: 600,
          },
        },
      },
    })
  }, [size, renderAs, color])

  return (
    <Component css={props} variation={variation}>
      {children}
    </Component>
  )
}
