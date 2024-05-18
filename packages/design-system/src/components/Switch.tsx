import { FC } from 'react'

import { useId } from '../hooks/ids'
import { styled } from '../theme'
import { Stack } from './Stack'

interface SwitchProps {
  id?: string
  value: boolean
  label: string
  onChange: (value: boolean) => void
}

const Button = styled('button', {
  position: 'relative',
  display: 'inline-block',
  width: 24,
  height: 14,
  borderRadius: 34,
  cursor: 'pointer',
  backgroundColor: '$gray8',
  transition: '.4s',
  '&:hover': {
    backgroundColor: '$gray7',
  },
  '&[aria-checked="true"]': {
    background: '$blue900',
    '&:hover': {
      backgroundColor: '$blue800',
    },
  },
})

const Value = styled('span', {
  position: 'absolute',
  content: '',
  height: 10,
  width: 10,
  left: 3,
  bottom: 2,
  borderRadius: 13,
  backgroundColor: 'white',
  transition: '.4s',
  variants: {
    checked: {
      true: {
        transform: 'translateX(8px)',
      },
    },
  },
})

const Label = styled('label', {
  color: '$gray11',
  fontSize: '$size60',
  userSelect: 'none',
})

export const Switch: FC<SwitchProps> = ({ id, value, label, onChange }) => {
  const ID = useId(id)

  return (
    <Stack direction="row" alignItems="center" spacing="$space40">
      <Button
        role="switch"
        type="button"
        aria-checked={value}
        id={ID}
        className="switch"
        onClick={() => onChange(!value)}
      >
        <Value checked={value} />
      </Button>

      <Label htmlFor={ID} className="switch">
        {label}
      </Label>
    </Stack>
  )
}
