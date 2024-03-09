import { FC, useMemo } from 'react'

import { styled } from '../../theme'
import { Box } from './Box'
import { Icon } from './Icon'
import { Stack } from './Stack'
import { Text } from './Text'

interface StepsProps {
  currentStep: string
  steps: Array<{
    label: string
    id: string
  }>
}

const space = '$space60'

const List = styled('ol', {
  display: 'flex',
  flexDirection: 'row',
  gap: space,
  '& li:first-child:after': {
    content: 'none',
  },
})

const ListItem = styled('li', {})

type StepState = 'completed' | 'current' | 'to_do'

const config = {
  completed: {
    icon: 'check_circle',
    color: '$white',
    backgroundColor: '$purple800',
  },
  current: {
    icon: 'edit',
    color: '$white',
    backgroundColor: '$purple800',
  },
  to_do: {
    icon: 'add',
    color: '$gray14',
    backgroundColor: '$gray7',
  },
} as const

interface GetStateParams {
  currentStepIndex: number
  stepIndex: number
}

const getState = ({
  currentStepIndex,
  stepIndex,
}: GetStateParams): StepState => {
  if (stepIndex === currentStepIndex) {
    return 'current'
  }

  if (stepIndex < currentStepIndex) {
    return 'completed'
  }

  return 'to_do'
}

export const Steps: FC<StepsProps> = ({ steps, currentStep }) => {
  const currentStepIndex = useMemo(() => {
    return steps.findIndex(step => step.id === currentStep) ?? 0
  }, [steps, currentStep])

  return (
    <nav aria-label="Steps">
      <List>
        {steps.map((step, index) => {
          const state = getState({ currentStepIndex, stepIndex: index })
          const { color, backgroundColor, icon } = config[state]

          return (
            <ListItem
              key={step.id}
              {...(state === 'current' && {
                'aria-current': 'step',
              })}
            >
              <Stack direction="row" spacing={space} alignItems="center">
                <Stack direction="row" spacing="$space60" alignItems="center">
                  <Box
                    borderRadius="50%"
                    width={24}
                    height={24}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={backgroundColor}
                  >
                    <Icon src={icon} size={14} color={color} />
                  </Box>

                  <Text
                    size="$size80"
                    color="$gray14"
                    variation={state === 'current' ? 'bold' : undefined}
                  >
                    {step.label}
                  </Text>
                </Stack>

                {index < steps.length - 1 && (
                  <Icon src="chevron_right" size={20} color="$gray9" />
                )}
              </Stack>
            </ListItem>
          )
        })}
      </List>
    </nav>
  )
}
