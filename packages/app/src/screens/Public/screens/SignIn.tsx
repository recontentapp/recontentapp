import { FC, useRef, useState } from 'react'

import { useAuth } from '../../../auth'
import { Logo } from '../../../components/Logo'
import {
  Box,
  Button,
  ExternalLink,
  Form,
  Heading,
  Link,
  Stack,
  Text,
  TextField,
  toast,
} from '../../../components/primitives'
import { HTTPRequestError, getAPIClient } from '../../../generated/apiClient'
import routes from '../../../routing'

interface State {
  email: string
  password: string
  newPassword: string
  confirmationCode: string
}

type Step = 'signin' | 'newPassword' | 'confirmationCode'

export const SignIn: FC = () => {
  const apiClient = useRef(
    getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
    }),
  )
  const [step, setStep] = useState<Step>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const [state, setState] = useState<State>({
    email: '',
    password: '',
    newPassword: '',
    confirmationCode: '',
  })

  const canSignInBeSubmitted =
    state.email.length > 0 && state.password.length > 0
  const canNewPasswordBeSubmitted =
    state.email.length > 0 && state.newPassword.length > 0
  const canConfirmationCodeBeSubmitted =
    state.email.length > 0 && state.confirmationCode.length > 0

  const onConfirmationCodeSubmit = () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)
    apiClient.current
      .confirmSignUp({
        body: {
          email: state.email,
          password: state.password,
          confirmationCode: state.confirmationCode.trim(),
        },
      })
      .then(res => {
        if (!res.ok) {
          toast('error', {
            title: 'Could not confirm your account',
          })
          return
        }

        return apiClient.current.logIn({
          body: {
            email: state.email,
            password: state.password,
          },
        })
      })
      .then(res => {
        if (!res) {
          return
        }

        if (!res.ok) {
          toast('error', {
            title: 'Could not sign in',
          })
          return
        }

        signIn(res.data.accessToken)
        return
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onSignInSubmit = () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)

    apiClient.current
      .logIn({
        body: {
          email: state.email,
          password: state.password,
        },
      })
      .then(res => {
        if (!res.ok) {
          if (
            res.error instanceof HTTPRequestError &&
            res.error.statusCode === 400
          ) {
            setStep('confirmationCode')
            return
          }

          toast('error', {
            title: 'Could not sign in',
          })
          return
        }

        signIn(res.data.accessToken)
      })
      .finally(() => setIsLoading(false))
  }

  const onNewPasswordSubmit = () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)
    // completeNewPasswordChallenge({
    //   password: state.newPassword,
    // }).catch(err => {
    //   console.log(err)
    //   setIsLoading(false)
    //   toast('error', {
    //     title: 'Could not confirm your account',
    //   })
    // })
  }

  const canBeSubmitted: Record<Step, boolean> = {
    confirmationCode: canConfirmationCodeBeSubmitted,
    newPassword: canNewPasswordBeSubmitted,
    signin: canSignInBeSubmitted,
  }

  const action: Record<Step, () => void> = {
    confirmationCode: onConfirmationCodeSubmit,
    newPassword: onNewPasswordSubmit,
    signin: onSignInSubmit,
  }

  return (
    <Box paddingY="$space600" paddingX="$space200">
      <Box width="100%" maxWidth={400} margin="0 auto">
        <Stack width="100%" direction="column" spacing="$space300">
          <Box width="100%" justifyContent="center" alignItems="center">
            <Logo variation="colorful" size={140} />
          </Box>

          <Stack direction="column" spacing="$space40">
            <Heading renderAs="h1" size="$size200">
              Sign in
            </Heading>
            <Text size="$size100" color="$gray11">
              New to Recontent? <Link to={routes.signUp.url({})}>Sign up</Link>{' '}
              for an account.
            </Text>
          </Stack>

          <Form onSubmit={action[step]}>
            <Stack width="100%" direction="column" spacing="$space200">
              <TextField
                label="Email"
                id="email"
                type="email"
                value={state.email}
                onChange={value =>
                  setState(state => ({
                    ...state,
                    email: value,
                  }))
                }
              />

              {step === 'signin' && (
                <Stack direction="column" spacing="$space80">
                  <TextField
                    label="Password"
                    id="password"
                    type="password"
                    value={state.password}
                    onChange={value =>
                      setState(state => ({
                        ...state,
                        password: value,
                      }))
                    }
                  />
                  <Text size="$size100" color="$gray11">
                    <Link to={routes.forgotPassword.url({})}>
                      Forgot password?
                    </Link>
                  </Text>
                </Stack>
              )}

              {step === 'newPassword' && (
                <Stack direction="column" spacing="$space200">
                  <Text
                    size="$size100"
                    color="$gray11"
                    lineHeight="$lineHeight200"
                  >
                    You need to choose a new password.
                  </Text>

                  <TextField
                    label="New password"
                    id="new_password"
                    type="password"
                    value={state.newPassword}
                    onChange={value =>
                      setState(state => ({
                        ...state,
                        newPassword: value,
                      }))
                    }
                  />
                </Stack>
              )}

              {step === 'confirmationCode' && (
                <Stack direction="column" spacing="$space200">
                  <Text
                    size="$size100"
                    color="$gray11"
                    lineHeight="$lineHeight200"
                  >
                    Please enter the confirmation code received by email.
                  </Text>

                  <TextField
                    label="Confirmation code"
                    id="confirmation_code"
                    type="text"
                    value={state.confirmationCode}
                    onChange={value =>
                      setState(state => ({
                        ...state,
                        confirmationCode: value,
                      }))
                    }
                  />
                </Stack>
              )}

              <Stack direction="column" spacing="$space100">
                <Button
                  variation="primary"
                  isFullwidth
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={!canBeSubmitted[step]}
                >
                  Sign in with email
                </Button>
              </Stack>
            </Stack>

            <Box paddingTop="$space200">
              <Text size="$size80" color="$gray11" lineHeight="$lineHeight300">
                By clicking "Sign in with Google/Email" above, you acknowledge
                that you have read and agree to our{' '}
                <ExternalLink
                  title="Terms of use"
                  fontSize="$size80"
                  target="_blank"
                  icon={false}
                  href="https://recontent.app/terms"
                >
                  Terms of use
                </ExternalLink>{' '}
                and{' '}
                <ExternalLink
                  title="Privacy policy"
                  fontSize="$size80"
                  target="_blank"
                  icon={false}
                  href="https://recontent.app/privacy"
                >
                  Privacy policy
                </ExternalLink>
                .
              </Text>
            </Box>
          </Form>
        </Stack>
      </Box>
    </Box>
  )
}
