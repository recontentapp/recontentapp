import { FC } from 'react'

import { styled } from '../../../../theme'
import { Icon } from '../../Icon'
import { Tooltip } from '../../Tooltip'
import { FieldProps } from '../types'

const Text = styled('label', {})

const LabelText = styled('span', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  fontSize: '$size100',
  fontWeight: 600,
  color: '$gray14',
  gap: '$space40',
  variants: {
    hidden: {
      true: {
        gap: '$space0',
        clip: 'rect(1, 1, 1, 1)',
        clipPath: 'inset(50%)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: 1,
      },
    },
  },
})

const OptionalText = styled('span', {
  color: '$gray10',
  fontWeight: 400,
  fontSize: '$size80',
})

type LabelProps = Pick<
  FieldProps,
  'id' | 'label' | 'hideLabel' | 'hint' | 'isOptional'
>

export const Label: FC<LabelProps> = ({
  id,
  label,
  hint,
  hideLabel = false,
  isOptional = false,
}) => {
  return (
    <Text htmlFor={id}>
      <LabelText hidden={hideLabel}>
        {label}
        {isOptional && <OptionalText>(Optional)</OptionalText>}
        {hint && (
          <Tooltip position="top" title={hint}>
            <span>
              <Icon src="help" size={14} color="$gray10" />
            </span>
          </Tooltip>
        )}
      </LabelText>
    </Text>
  )
}
