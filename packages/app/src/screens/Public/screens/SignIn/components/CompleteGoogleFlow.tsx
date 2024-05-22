import { FC, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../../../auth'
import { Logo } from '../../../../../components/Logo'
import { Box, ExternalLink, Stack, Text, toast, Spinner } from 'design-system'
import {
  HTTPRequestError,
  getAPIClient,
} from '../../../../../generated/apiClient'
import routes from '../../../../../routing'
import { useCodeSearchParams } from '../../../hooks'

export const CompleteGoogleFlow: FC = () => {
  const code = useCodeSearchParams()
  const isLoading = useRef<boolean>(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const apiClient = useRef(
    getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
    }),
  )

  useEffect(() => {
    if (!code || isLoading.current) {
      return
    }

    isLoading.current = true
    apiClient.current
      .exchangeGoogleCodeForAccessToken({
        body: {
          code,
        },
      })
      .then(res => {
        if (!res.ok) {
          throw res.error
        }

        signIn(res.data.accessToken)
      })
      .catch(err => {
        if (err instanceof HTTPRequestError && err.statusCode === 403) {
          toast('error', { title: 'Your account has been blocked' })
        } else {
          toast('error', { title: 'Failed to sign in with Google' })
        }

        navigate(routes.signUp.url({}))
      })
  }, [])

  return (
    <Box paddingY="$space600" paddingX="$space200">
      <Box width="100%" maxWidth={400} margin="0 auto">
        <Stack width="100%" direction="column" spacing="$space300">
          <Box width="100%" justifyContent="center" alignItems="center">
            <Logo variation="colorful" size={140} />
          </Box>

          <Stack
            direction="column"
            height={300}
            alignItems="center"
            justifyContent="center"
            spacing="$space100"
          >
            <Spinner size={32} color="$purple800" />
          </Stack>

          <Box paddingTop="$space200">
            <Text size="$size80" color="$gray11" lineHeight="$lineHeight300">
              By clicking "Sign in with Google/Email" above, you acknowledge
              that you have read and agree to our{' '}
              <ExternalLink
                title="Terms of use"
                fontSize="$size80"
                icon={false}
                href="https://recontent.app/terms"
              >
                Terms of use
              </ExternalLink>{' '}
              and{' '}
              <ExternalLink
                title="Privacy policy"
                fontSize="$size80"
                icon={false}
                href="https://recontent.app/privacy"
              >
                Privacy policy
              </ExternalLink>
              .
            </Text>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
