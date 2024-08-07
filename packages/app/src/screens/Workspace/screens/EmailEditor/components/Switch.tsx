import { Icon, Tooltip } from 'design-system'
import { FC } from 'react'
import { styled } from '../../../../../theme'

export type Mode = 'code' | 'content'

interface SwitchProps {
  value: Mode
  onChange: (value: Mode) => void
}

const Button = styled('button', {
  position: 'relative',
  display: 'inline-block',
  width: 54,
  height: 32,
  borderRadius: 34,
  cursor: 'pointer',
  backgroundColor: '$blue800',
  transition: '.3s',
  '&:hover': {
    backgroundColor: '$blue900',
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  content: '',
  height: 24,
  width: 24,
  left: 4,
  bottom: 4,
  borderRadius: 13,
  backgroundColor: '$white',
  transition: '.3s',
  variants: {
    checked: {
      true: {
        transform: 'translateX(22px)',
      },
    },
  },
})

export const Switch: FC<SwitchProps> = ({ value, onChange }) => {
  const checked = value === 'code'

  return (
    <Tooltip title="Switch between code/content editor" position="bottom">
      <Button
        role="switch"
        type="button"
        aria-checked={checked}
        id="email-editor-switch"
        className="switch"
        onClick={() => onChange(checked ? 'content' : 'code')}
      >
        <Value checked={checked}>
          <Icon
            color="$gray11"
            size={16}
            src={value === 'code' ? 'code' : 'translate'}
          />
        </Value>
      </Button>
    </Tooltip>
  )
}
