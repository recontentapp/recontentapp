import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from '@reach/listbox'
import { CSSProperties, FC } from 'react'

import { useId } from '../../../hooks/ids'
import { globalCss, keyframes, styled, theme } from '../../../theme'
import { Stack } from '../Stack'
import { Label } from './components/Label'
import { Message } from './components/Message'
import { FieldProps, Option } from './types'

interface SelectFieldProps extends FieldProps, Pick<CSSProperties, 'width'> {
  value?: string
  options: Option[]
  portal?: boolean
  onChange: (value?: Option) => void
  headerLabel?: string
  footerAction?: {
    label: string
    onAction: () => void
  }
}

const PLACEHOLDER = '__default'

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateY(4px)' },
  '100%': { opacity: 1, transform: 'translateY(0px)' },
})

export const globalStyles = globalCss({
  '[data-reach-listbox-popover]': {
    display: 'block',
    position: 'absolute',
    zIndex: 120,
    minWidth: 'min-content',
    outline: 'none',
    backgroundColor: '$white',
    border: '1px solid $gray7',
    borderRadius: '$radius100',
    marginTop: '$space60',
    boxShadow: '$shadow100',
    animation: `${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },

  '[data-reach-listbox-popover]:focus-within': {},

  '[data-reach-listbox-popover][hidden]': {
    display: 'none',
  },

  '[data-reach-listbox-list]': {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    maxHeight: 300,
    overflowY: 'auto',
  },

  '[data-reach-listbox-list]:focus': {
    boxShadow: 'none',
    outline: 'none',
  },

  '[data-reach-listbox-option]': {
    fontSize: '$size80',
    fontWeight: 500,
    color: '$gray14',
    paddingX: '$space80',
    paddingY: '$space80',
    cursor: 'pointer',
    margin: 0,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },

  '[data-reach-listbox-option][data-current-nav]': {
    backgroundColor: '$gray3',
  },

  '[data-reach-listbox-option][data-current-selected]': {
    fontWeight: 500,
  },

  '[data-reach-listbox-option][data-current-selected][data-confirming]': {},

  '[data-reach-listbox-option][aria-disabled="true"]': {
    opacity: 0.5,
  },

  '[data-reach-listbox-input]': {
    '[data-reach-listbox-button]': {
      color: '$gray14',
    },
    [`&[data-value="${PLACEHOLDER}"]`]: {
      '[data-reach-listbox-button]': {
        color: '$gray10',
      },
    },
  },

  '[data-reach-listbox-button]': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundColor: '$white',
    width: '100%',
    minHeight: 35,
    border: '1px solid $gray7',
    borderRadius: '$radius200',
    paddingX: '$space80',
    paddingY: '$space60',
    fontSize: '$size80',
    boxShadow: '$shadow100',
    transition: 'all 0.06s ease-in-out',
    outline: 'none',
    '&:focus': {
      boxShadow:
        'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
      outlineColor: theme.colors.blue900,
      outlineOffset: -0.6,
      outlineStyle: 'auto',
      outlineWidth: 2,
    },

    '&[data-error="true"]': {
      outlineColor: theme.colors.red200,
      outlineOffset: -0.6,
      outlineStyle: 'auto',
      outlineWidth: 2,
      boxShadow:
        'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
    },

    '&[aria-expanded="true"]': {
      boxShadow:
        'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
      outlineColor: theme.colors.blue900,
      outlineOffset: -0.6,
      outlineStyle: 'auto',
      outlineWidth: 2,
    },
  },

  '[data-reach-listbox-button][aria-disabled="true"]': {
    opacity: 0.5,
  },

  '[data-reach-listbox-arrow]': {
    marginLeft: '0.5rem',
    display: 'block',
    fontSize: ' 0.5em',
  },
})

const HeaderLabel = styled('span', {
  display: 'block',
  fontSize: '$size60',
  color: '$gray9',
  fontWeight: 500,
  paddingX: '$space80',
  paddingY: '$space60',
  borderBottom: '1px solid $gray4',
})

const FooterAction = styled('button', {
  color: '$blue900',
  fontWeight: 500,
  fontSize: '$size60',
  paddingX: '$space100',
  paddingY: '$space60',
  cursor: 'pointer',
  '&:hover,&:focus': {
    color: '$blue800',
  },
  '&:active': {
    color: '$blue700',
  },
})

export const SelectField: FC<SelectFieldProps> = ({
  label,
  hideLabel = false,
  portal = false,
  width,
  placeholder,
  onChange,
  onBlur,
  value,
  id,
  name,
  options,
  hint,
  isOptional,
  footerAction,
  headerLabel,
  info,
  error,
}) => {
  const ID = useId(id)

  const onSelect = (value: string) => {
    const matchingOption = options.find(option => option.value === value)

    if (!matchingOption) {
      onChange(undefined)
      return
    }

    onChange(matchingOption)
  }

  return (
    <Stack
      direction="column"
      spacing={hideLabel ? '$space0' : '$space60'}
      width={width}
    >
      <Label
        id={ID}
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        isOptional={isOptional}
      />

      <ListboxInput
        aria-labelledby={ID}
        value={value}
        name={name}
        onChange={onSelect}
        onBlur={onBlur}
      >
        <ListboxButton arrow="▼" data-error={!!error} />
        <ListboxPopover portal={portal}>
          {headerLabel && <HeaderLabel>{headerLabel}</HeaderLabel>}
          <ListboxList>
            {placeholder && (
              <ListboxOption value={PLACEHOLDER}>{placeholder}</ListboxOption>
            )}

            {options.map(option => (
              <ListboxOption key={option.value} value={option.value}>
                {option.label}
              </ListboxOption>
            ))}
          </ListboxList>
          {footerAction && (
            <FooterAction onClick={footerAction.onAction}>
              {footerAction.label}
            </FooterAction>
          )}
        </ListboxPopover>
      </ListboxInput>

      <Message error={error} info={info} />
    </Stack>
  )
}
