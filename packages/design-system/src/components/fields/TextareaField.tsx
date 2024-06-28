import { CSSProperties, FC, useState } from 'react'

import { useId } from '../../hooks/ids'
import { styled } from '../../stitches'
import { theme } from '../../theme'
import { Stack } from '../Stack'
import { Label } from './components/Label'
import { Message } from './components/Message'
import { FieldProps } from './types'

interface TextareaFieldProps
  extends FieldProps,
    Pick<CSSProperties, 'maxWidth' | 'width'> {
  onChange: (value: string) => void
  value?: string
  initialValue?: string
}

const Input = styled('textarea', {
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  outline: 'none',
  paddingX: '$space80',
  paddingY: '$space60',
  fontSize: '$size80',
  boxShadow: '$shadow100',
  resize: 'vertical',
  transition: 'all 0.06s ease-in-out',
  '&:disabled': {
    backgroundColor: '$gray4',
    color: '$gray11',
    cursor: 'not-allowed',
  },
  variants: {
    variation: {
      error: {
        outlineColor: theme.colors.red200,
        outlineOffset: -0.6,
        outlineStyle: 'auto',
        outlineWidth: 2,
        boxShadow:
          'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
      },
    },
  },
  '&:focus': {
    outlineColor: theme.colors.blue900,
    outlineOffset: -0.6,
    outlineStyle: 'auto',
    outlineWidth: 2,
    boxShadow:
      'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
  },
})

export const TextareaField: FC<TextareaFieldProps> = ({
  label,
  hideLabel = false,
  autoFocus = false,
  placeholder,
  onChange,
  onBlur,
  value: controlledValue,
  initialValue,
  error,
  info,
  id,
  name,
  hint,
  isDisabled,
  isOptional,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(initialValue ?? '')
  const ID = useId(id)

  return (
    <Stack
      direction="column"
      spacing={hideLabel ? '$space0' : '$space60'}
      {...props}
    >
      <Label
        id={ID}
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        isOptional={isOptional}
      />

      <Input
        autoFocus={autoFocus}
        variation={error ? 'error' : undefined}
        id={ID}
        name={name}
        disabled={isDisabled}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={e => {
          onChange(e.target.value)
          if (!controlledValue) {
            setLocalValue(e.target.value)
          }
        }}
        value={controlledValue ?? localValue}
      />

      <Message error={error} info={info} />
    </Stack>
  )
}
