import { FC, useState } from 'react'

import {
  Button,
  Form,
  Heading,
  Stack,
  Text,
  TextField,
  toast,
} from '../../../../../components/primitives'
import { styled } from '../../../../../theme'
import { useSetupBillingSettings } from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

const Container = styled('div', {
  display: 'inline-flex',
  position: 'relative',
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  paddingY: '$space200',
  paddingX: '$space100',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  '&::after': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    content: '',
    display: 'block',
    width: '100%',
    height: 3,
    backgroundColor: '$purple800',
    borderTopRightRadius: '$radius200',
    borderTopLeftRadius: '$radius200',
  },
})

interface BillingWizardProps {
  onChange: () => void
}

interface State {
  name: string
  email: string
}

export const BillingWizard: FC<BillingWizardProps> = ({ onChange }) => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { mutateAsync, isPending } = useSetupBillingSettings()
  const [state, setState] = useState<State>({
    name: '',
    email: '',
  })

  const isValid = state.name.length > 0 && state.email.length > 0

  const onSubmit = () => {
    if (!isValid) {
      return
    }

    mutateAsync({
      body: {
        workspaceId,
        name: state.name,
        email: state.email,
      },
    }).then(() => {
      toast('success', {
        title: 'Billing settings updated',
      })

      onChange()
    })
  }

  return (
    <Container>
      <Stack direction="row" spacing="$space60">
        <Stack direction="column" spacing="$space300">
          <Stack direction="column" spacing="$space60">
            <Heading size="$size100" renderAs="span">
              Billing is not yet set up for your workspace
            </Heading>

            <Text size="$size80" color="$gray11">
              In order to subscribe to Recontent.app, please provide your entity
              name and email address.
            </Text>
          </Stack>

          <Form onSubmit={onSubmit}>
            <Stack direction="column" maxWidth={400} spacing="$space100">
              <TextField
                label="Entity name"
                placeholder="ACME Inc"
                value={state.name}
                onChange={name => setState({ ...state, name })}
              />

              <TextField
                label="Email address"
                placeholder="billing@acme.com"
                value={state.email}
                onChange={email => setState({ ...state, email })}
              />

              <div>
                <Button
                  variation="primary"
                  type="submit"
                  isDisabled={!isValid}
                  isLoading={isPending}
                >
                  Set up billing
                </Button>
              </div>
            </Stack>
          </Form>
        </Stack>
      </Stack>
    </Container>
  )
}
