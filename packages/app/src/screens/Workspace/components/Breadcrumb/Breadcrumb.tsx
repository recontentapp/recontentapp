import { FC, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Tooltip } from 'design-system'
import { styled } from '../../../../theme'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

const Container = styled('nav', {
  display: 'flex',
  alignItems: 'center',
})

const Separator = styled('span', {
  color: '$gray7',
  fontWeight: 400,
  fontSize: '$size80',
  paddingX: '$space40',
})

const List = styled('ol', {
  display: 'flex',
  flexDirection: 'row',
})

const sharedListItemStyles = {
  display: 'inline-flex',
  paddingY: '$space60',
  paddingX: '$space60',
  color: '$gray13',
  fontWeight: 500,
  fontSize: '$size80',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  outline: 'none',
}

const ListItem = styled('li', {
  '.breadcrumb__item': {
    ...sharedListItemStyles,
  },
  '.breadcrumb__link': {
    ...sharedListItemStyles,
    '&:hover,&:focus': {
      backgroundColor: '$gray3',
    },
  },
})

const TextEllipsisContainer = styled('span', {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  maxWidth: 300,
})

const TextEllipsis: FC<{ children: string }> = ({ children }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    if (ref.current.offsetWidth < ref.current.scrollWidth) {
      setShowTooltip(true)
    }
  }, [])

  return (
    <Tooltip
      title={children}
      position="bottom"
      isDisabled={!showTooltip}
      constrained={false}
    >
      <TextEllipsisContainer ref={ref}>{children}</TextEllipsisContainer>
    </Tooltip>
  )
}

export const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => {
  return (
    <Container aria-label="Breadcrumb">
      <List>
        {items.map((item, index) => {
          if (!item.path) {
            return (
              <ListItem key={index}>
                <span className="breadcrumb__item">
                  <TextEllipsis>{item.label}</TextEllipsis>
                </span>

                {index < items.length - 1 && <Separator>/</Separator>}
              </ListItem>
            )
          }

          return (
            <ListItem key={index}>
              <Link className="breadcrumb__link" to={item.path}>
                <TextEllipsis>{item.label}</TextEllipsis>
              </Link>

              {index < items.length - 1 && <Separator>/</Separator>}
            </ListItem>
          )
        })}
      </List>
    </Container>
  )
}
