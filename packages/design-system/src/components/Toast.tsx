import notify, { Toaster } from 'react-hot-toast'

import { theme } from '../theme'
import { Stack } from './Stack'
import { Text } from './Text'

type ToastVariation = 'success' | 'error'

interface ToastContent {
  title: string
  description?: string
}

export const Toast = () => (
  <Toaster
    containerStyle={{ top: 24 }}
    toastOptions={{
      duration: 4000,
      position: 'top-center',
      style: {
        border: `1px solid ${theme.colors.gray7}`,
        boxShadow: theme.shadows.shadow400,
      },
      success: {
        iconTheme: {
          primary: theme.colors.green100,
          secondary: theme.colors.white,
        },
      },
      error: {
        iconTheme: {
          primary: theme.colors.red100,
          secondary: theme.colors.white,
        },
      },
    }}
  />
)

export const toast = (variation: ToastVariation, content: ToastContent) => {
  switch (variation) {
    case 'success':
      notify.success(
        <Stack direction="column" spacing="$space40">
          <Text
            size="$size80"
            color="$gray14"
            variation={content.description ? 'bold' : undefined}
          >
            {content.title}
          </Text>
          {content.description && (
            <Text size="$size60" color="$gray11">
              {content.description}
            </Text>
          )}
        </Stack>,
      )
      break
    case 'error':
      notify.error(
        <Stack direction="column" spacing="$space40">
          <Text
            size="$size80"
            color="$gray14"
            variation={content.description ? 'bold' : undefined}
          >
            {content.title}
          </Text>
          {content.description && (
            <Text size="$size60" color="$gray11">
              {content.description}
            </Text>
          )}
        </Stack>,
      )
      break
  }
}
