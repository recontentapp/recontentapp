import { FC, useState } from 'react'

import { Logo } from '../../../components/Logo'
import {
  Box,
  Button,
  Form,
  Heading,
  Link,
  Stack,
  Text,
  TextField,
} from '../../../components/primitives'
import { toSignIn } from '../routes'

interface RequestState {
  email: string
}

interface ResponseState {
  verificationCode: string
  newPassword: string
}

export const ForgotPassword: FC = () => {
  const [step, setStep] = useState<'request' | 'response'>('request')
  const [requestState, setRequestState] = useState<RequestState>({
    email: '',
  })
  const [responseState, setResponseState] = useState<ResponseState>({
    verificationCode: '',
    newPassword: '',
  })

  const canRequestBeSubmitted = requestState.email.length > 0
  const canResponseBeSubmitted =
    responseState.verificationCode.length > 0 &&
    responseState.newPassword.length > 0

  const onRequestSubmit = () => {}

  const onResponseSubmit = () => {}

  return (
    <Box paddingY="$space600" paddingX="$space200">
      <Box width="100%" maxWidth={400} margin="0 auto">
        <Stack width="100%" direction="column" spacing="$space300">
          <Box width="100%" justifyContent="center" alignItems="center">
            <Logo variation="colorful" size={140} />
          </Box>

          <Stack direction="column" spacing="$space40">
            <Heading renderAs="h1" size="$size200">
              Forgot password
            </Heading>
            <Text size="$size100" color="$gray11">
              Remember your password? <Link to={toSignIn()}>Sign in</Link> to
              your account.
            </Text>
          </Stack>

          {step === 'request' ? (
            <Form onSubmit={onRequestSubmit}>
              <Stack direction="column" spacing="$space200">
                <TextField
                  label="Email"
                  id="email"
                  value={requestState.email}
                  onChange={value =>
                    setRequestState(state => ({
                      ...state,
                      email: value,
                    }))
                  }
                />

                <Box>
                  <Button
                    variation="primary"
                    isFullwidth
                    type="submit"
                    isDisabled={!canRequestBeSubmitted}
                  >
                    Request a password reset
                  </Button>
                </Box>
              </Stack>
            </Form>
          ) : (
            <Form onSubmit={onResponseSubmit}>
              <TextField
                label="Verification code"
                id="verification_code"
                value={responseState.verificationCode}
                onChange={value =>
                  setResponseState(state => ({
                    ...state,
                    verificationCode: value,
                  }))
                }
              />
              <TextField
                label="New password"
                id="new_password"
                value={responseState.newPassword}
                onChange={value =>
                  setResponseState(state => ({
                    ...state,
                    newPassword: value,
                  }))
                }
              />

              <Button
                variation="primary"
                type="submit"
                isFullwidth
                isDisabled={!canResponseBeSubmitted}
              >
                Reset password
              </Button>
            </Form>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
