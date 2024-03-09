import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
} from '../../../components/primitives'
import { toSignIn } from '../routes'

interface State {
  email: string
  password: string
}

export const SignUp: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<State>({
    email: '',
    password: '',
  })

  const canSignUpBeSubmitted =
    state.email.length > 0 && state.password.length > 0

  const onSignUpSubmit = () => {
    setLoading(true)
  }

  return (
    <Box paddingY="$space600" paddingX="$space200">
      <Box width="100%" maxWidth={400} margin="0 auto">
        <Stack direction="column" spacing="$space300">
          <Box width="100%" justifyContent="center" alignItems="center">
            <Logo variation="colorful" size={140} />
          </Box>

          <Stack direction="column" spacing="$space40">
            <Heading renderAs="h1" size="$size200">
              Sign Up
            </Heading>
            <Text size="$size100" color="$gray11">
              Already have an account? <Link to={toSignIn()}>Sign in.</Link>
            </Text>
          </Stack>

          <Form onSubmit={onSignUpSubmit}>
            <Stack direction="column" spacing="$space200">
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
              <TextField
                label="Password"
                id="password"
                type="password"
                info="At least 8 characters with uppercase, lowercase & digits"
                value={state.password}
                onChange={value =>
                  setState(state => ({
                    ...state,
                    password: value,
                  }))
                }
              />

              <Stack direction="column" spacing="$space100">
                <Button
                  variation="primary"
                  type="submit"
                  isFullwidth
                  isLoading={loading}
                  isDisabled={!canSignUpBeSubmitted}
                >
                  Sign up with email
                </Button>

                {/* <GoogleButton onAction={signInWithGoogle} /> */}
              </Stack>
            </Stack>

            <Box paddingTop="$space200">
              <Text size="$size80" color="$gray11" lineHeight="$lineHeight300">
                By clicking Sign in/up with Google/Email" above, you acknowledge
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
