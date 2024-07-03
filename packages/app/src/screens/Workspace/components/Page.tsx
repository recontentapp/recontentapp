import { FC, ReactNode } from 'react'
import { Link, LinkProps, useMatch, useResolvedPath } from 'react-router-dom'

import { Box, Heading, Stack, Text } from 'design-system'
import { styled } from '../../../theme'

interface PageTab {
  label: string
  badge?: string | number
  to: string
}

interface PageProps {
  title?: string
  titleRightContent?: ReactNode
  subtitle?: string
  description?: string | ReactNode
  tabs?: PageTab[]
  children: ReactNode
}

const CustomLinkContainer = styled('div', {
  variants: {
    match: {
      true: {
        a: {
          color: '$purple800',
          borderBottomColor: '$purple800',
          '&:hover,&:focus': {
            color: '$purple700',
            borderBottomColor: '$purple700',
          },
        },
      },
    },
  },
  a: {
    fontWeight: 500,
    position: 'relative',
    display: 'inline-block',
    textDecoration: 'none',
    color: '$gray11',
    transition: 'all 0.2s ease-in-out',
    paddingBottom: 12,
    borderBottom: '2px solid transparent',
    '&:hover,&:focus': {
      color: '$gray14',
      borderBottomColor: '$gray14',
    },
    span: {
      display: 'inline-block',
      marginLeft: '$space60',
      borderRadius: '$radius300',
      paddingY: '$space20',
      paddingX: '$space40',
      fontSize: '$size60',
      backgroundColor: '$gray5',
      minWidth: 20,
      textAlign: 'center',
      color: '$gray14',
    },
  },
})

const CustomLink: FC<LinkProps> = ({ children, to, ...props }) => {
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: true })

  return (
    <CustomLinkContainer match={!!match}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </CustomLinkContainer>
  )
}

const CONTENT_MAX_WIDTH = 1060

export const Page: FC<PageProps> = ({
  title,
  titleRightContent,
  description,
  subtitle,
  tabs,
  children,
}) => {
  return (
    <Stack width="100%" direction="row" spacing="$space200">
      <Box flexGrow={1} position="relative" paddingTop="$space400">
        <Stack direction="column" spacing="$space300" width="100%">
          {title && (
            <Box
              width="100%"
              maxWidth={CONTENT_MAX_WIDTH}
              margin="0 auto"
              paddingX="$space400"
            >
              <Stack direction="column" spacing="$space60">
                {subtitle && (
                  <Text size="$size100" color="$gray11">
                    {subtitle}
                  </Text>
                )}
                <Stack
                  direction="column"
                  spacing={
                    typeof description === 'string' ? '$space80' : '$space200'
                  }
                >
                  <Stack
                    direction="row"
                    spacing="$space100"
                    alignItems="center"
                  >
                    <Heading
                      renderAs="h1"
                      size="$size500"
                      lineHeight="$lineHeight100"
                    >
                      {title}
                    </Heading>

                    {titleRightContent && <Box>{titleRightContent}</Box>}
                  </Stack>

                  {description && typeof description === 'string' ? (
                    <Text
                      size="$size100"
                      color="$gray11"
                      maxWidth={600}
                      lineHeight="$lineHeight300"
                    >
                      {description}
                    </Text>
                  ) : (
                    description
                  )}
                </Stack>
              </Stack>
            </Box>
          )}

          {tabs && (
            <Stack direction="column" spacing="$space0">
              {tabs.length > 0 && (
                <Box
                  width="100%"
                  renderAs="nav"
                  maxWidth={CONTENT_MAX_WIDTH}
                  margin="0 auto"
                  paddingX="$space400"
                >
                  <Stack
                    renderAs="ul"
                    direction="row"
                    alignItems="center"
                    spacing="$space200"
                  >
                    {tabs.map((tab, index) => (
                      <li key={index}>
                        <CustomLink to={tab.to}>
                          {tab.label}
                          {tab.badge && <span>{tab.badge}</span>}
                        </CustomLink>
                      </li>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}

          <Box
            width="100%"
            maxWidth={CONTENT_MAX_WIDTH}
            margin="0 auto"
            paddingX="$space400"
            paddingBottom="$space700"
          >
            {children}
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}
