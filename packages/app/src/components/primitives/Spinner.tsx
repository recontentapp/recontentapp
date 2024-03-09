import { FC } from 'react'

import { ColorValue, keyframes, styled } from '../../theme'

const Container = styled('div', {
  display: 'inline-flex',
  flexShrink: 0,
})

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const Svg = styled('svg', {
  animation: `${spin} 1s linear infinite`,
})

interface SpinnerProps {
  size: number
  color: ColorValue
}

export const Spinner: FC<SpinnerProps> = ({ size, color }) => {
  return (
    <Container aria-busy="true" role="alertdialog">
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
        strokeWidth="2"
        strokeLinecap="round"
        width={size}
        height={size}
        css={{
          stroke: color,
        }}
      >
        <path
          transform="translate(-25.000000, -10.000000)"
          d="M34,27 C38.418278,27 42,23.418278 42,19 C42,14.6384752 38.5097021,11.0921531 34.1698397,11.0017671 C34.1133683,11.000591 34.0567532,11 34,11 C29.581722,11 26,14.581722 26,19"
          fill="none"
        />
      </Svg>
    </Container>
  )
}
