import { CSSProperties, FC } from 'react'
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from 'react-router-dom'

import { FontSizeValue, styled } from '../theme'
import { Icon } from './Icon'

interface ExternalLinkProps extends Pick<CSSProperties, 'fontSize'> {
  href: string
  title: string
  icon?: boolean
  children: string
}

const styles = {
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '$space40',
  color: '$blue900',
  fontWeight: 500,
  lineHeight: '$lineHeight200',
  transition: 'all 0.2s ease-in-out',
  '& path': {
    transition: 'all 0.2s ease-in-out',
  },
  '&:hover': {
    color: '$blue700',
  },
} as const

const IconContainer = styled('span', {
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

interface LinkProps extends ReactRouterLinkProps {
  size?: FontSizeValue
}

export const Link: FC<LinkProps> = ({ size, ...props }) => {
  return (
    <Container css={size ? { '& a': { fontSize: size } } : undefined}>
      <ReactRouterLink {...props} />
    </Container>
  )
}
