import { FC, ReactElement, ReactNode } from 'react'

import { Box, Stack } from 'design-system'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'
import { styled } from '../../../theme'

interface ScreenWrapperProps {
  children: ReactNode
  breadcrumbItems: BreadcrumbItem[]
  rightContent?: ReactElement
}

const Container = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
})

const ContentContainer = styled('div', {
  flexGrow: 1,
  overflowY: 'auto',
})

export const ScreenWrapper: FC<ScreenWrapperProps> = ({
  breadcrumbItems,
  rightContent,
  children,
}) => {
  return (
    <Container>
      {(breadcrumbItems.length > 0 || rightContent) && (
        <Box
          backgroundColor="$gray1"
          width="100%"
          paddingY="$space60"
          paddingLeft="$space80"
          paddingRight="$space100"
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Breadcrumb items={breadcrumbItems} />

            <Box>{rightContent}</Box>
          </Stack>
        </Box>
      )}

      <ContentContainer>{children}</ContentContainer>
    </Container>
  )
}
