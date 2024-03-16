import { FC, ReactNode } from 'react'

import { Box, Heading, Stack } from '../../../components/primitives'

interface SettingsSectionProps {
  title: string
  withBottomBar?: boolean
  children: ReactNode
}

export const SettingsSection: FC<SettingsSectionProps> = ({
  title,
  withBottomBar,
  children,
}) => {
  return (
    <Stack direction="column" renderAs="section" spacing="$space100">
      <Heading renderAs="h2" size="$size200">
        {title}
      </Heading>

      {children}

      {withBottomBar && (
        <Box
          width="100%"
          height={1}
          backgroundColor="$gray7"
          marginTop="$space200"
        />
      )}
    </Stack>
  )
}
