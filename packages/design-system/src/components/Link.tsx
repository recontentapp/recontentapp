import { CSSProperties, FC, ReactNode } from 'react'

import { FontSizeValue } from '../theme'
import { Icon } from './Icon'
import { styled } from '../stitches'

interface ExternalLinkProps extends Pick<CSSProperties, 'fontSize'> {
  href: string
  title: string
  icon?: boolean
  children: string
}

const styles = {
  color: '$blue900',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  '& path': {
    transition: 'all 0.2s ease-in-out',
  },
  '&:hover': {
    color: '$blue700',
  },
} as const

const IconContainer = styled('span', {
  display: 'inline-block',
  marginRight: '$space20',
  transform: 'translateY(3px)',
})

const ExternalContainer = styled('a', styles)

export const ExternalLink: FC<ExternalLinkProps> = ({
  href,
  title,
  icon = true,
  children,
  ...props
}) => {
  return (
    <ExternalContainer href={href} title={title} target="_blank" css={props}>
      {icon && (
        <IconContainer>
          <Icon src="open_in_new" size={16} color="$blue900" />
        </IconContainer>
      )}

      <span>{children}</span>
    </ExternalContainer>
  )
}

const Container = styled('span', {
  '& a': styles,
})

interface LinkWrapperProps {
  size?: FontSizeValue
  children: ReactNode
}

export const LinkWrapper: FC<LinkWrapperProps> = ({ size, children }) => {
  return (
    <Container css={size ? { '& a': { fontSize: size } } : undefined}>
      {children}
    </Container>
  )
}
