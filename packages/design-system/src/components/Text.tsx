import { CSSProperties } from '@stitches/react'
import { FC, ReactNode, useMemo } from 'react'

import { styled } from '../stitches'
import { ColorValue, FontSizeValue } from '../theme'

interface TextProps
  extends Pick<CSSProperties, 'maxWidth' | 'lineHeight' | 'textAlign'> {
  children: ReactNode
  size: FontSizeValue
  textWrap?: 'balance'
  variation?: 'caps' | 'bold' | 'semiBold'
  color: ColorValue
  renderAs?: 'p' | 'span'
}

export const Text: FC<TextProps> = ({
  size,
  renderAs = 'p',
  color,
  textWrap,
  variation,
  children,
  ...props
}) => {
  const Component = useMemo(() => {
    return styled(renderAs, {
      fontWeight: 400,
      fontSize: size,
      color,
      textWrap,
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
  }, [size, renderAs, color, textWrap])

  return (
    <Component css={props} variation={variation}>
      {children}
    </Component>
  )
}
