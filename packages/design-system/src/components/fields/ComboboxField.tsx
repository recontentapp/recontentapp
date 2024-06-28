import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox'
import {
  CSSProperties,
  ChangeEventHandler,
  FC,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useId } from '../../hooks/ids'
import { globalCss, keyframes, styled } from '../../stitches'
import { theme } from '../../theme'
import { Icon } from '../Icon'
import { Stack } from '../Stack'
import { Label } from './components/Label'
import { Message } from './components/Message'
import { FieldProps, Option } from './types'

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateY(4px)' },
  '100%': { opacity: 1, transform: 'translateY(0px)' },
})

export const globalStyles = globalCss({
  '[data-reach-combobox-input]': {
    backgroundColor: '$white',
    width: '100%',
    border: '1px solid $gray7',
    borderRadius: '$radius200',
    paddingX: '$space80',
    paddingY: '$space60',
    fontSize: '$size80',
    boxShadow: '$shadow100',
    transition: 'all 0.06s ease-in-out',
    '&[data-error="true"]': {
      outlineColor: theme.colors.red200,
      outlineOffset: -0.6,
      outlineStyle: 'auto',
      outlineWidth: 2,
      boxShadow:
        'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
    },
    '&:focus': {
      outlineColor: theme.colors.blue900,
      outlineOffset: -0.6,
      outlineStyle: 'auto',
      outlineWidth: 2,
      boxShadow:
        'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
    },
    '&.combobox-field--headless': {
      border: 'none',
      paddingLeft: 0,
      outline: 'none',
      boxShadow: 'none',
      '&:focus': {
        boxShadow: 'none !important',
      },
    },
  },
  '[data-reach-combobox-popover]': {
    backgroundColor: '$white',
    border: '1px solid $gray7',
    borderRadius: '$radius200',
    marginTop: '$space60',
    boxShadow: '$shadow100',
    animation: `${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
    zIndex: 100,
  },
  '[data-reach-combobox-list]': {
    maxHeight: 400,
    overflowY: 'scroll',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    userSelect: 'none',
  },
  '[data-reach-combobox-option]': {
    fontSize: '$size80',
    fontWeight: 500,
    color: '$gray14',
    paddingX: '$space80',
    paddingY: '$space80',
    cursor: 'pointer',
    margin: 0,
  },
  '[data-reach-combobox-option][aria-selected="true"]': {
    backgroundColor: '$gray3',
  },
  '[data-reach-combobox-option]:hover': {
    backgroundColor: '$gray3',
  },
  '[data-reach-combobox-option][aria-selected="true"]:hover': {},
  '[data-suggested-value]': {},
})

const SelectedOption = styled('div', {
  display: 'inline-block',
  backgroundColor: '$gray3',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  border: '1px solid $gray6',
  color: '$gray14',
  fontSize: '$size80',
  fontWeight: 500,
  paddingLeft: '$space60',
  paddingRight: '$space40',
  paddingY: '$space40',
})

const CloseButton = styled('button', {
  cursor: 'pointer',
  width: 18,
  height: 18,
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$gray6',
  },
  '&:active': {
    backgroundColor: '$gray7',
  },
})

interface ComboboxFieldProps extends FieldProps, Pick<CSSProperties, 'width'> {
  isHeadless?: boolean
  options: Option[]
  value?: string[]
  onSearchChange?: (value: string) => void
  onChange: (value: string[]) => void
  isMultiple?: boolean
  usePortal?: boolean
}

export const ComboboxField: FC<ComboboxFieldProps> = ({
  label,
  hideLabel,
  isHeadless,
  hint,
  value,
  isOptional,
  onSearchChange,
  onChange,
  onBlur,
  width,
  id,
  options,
  isMultiple = false,
  usePortal = true,
  placeholder,
  info,
  error,
}) => {
  const ID = useId(id)
  const ref = useRef<HTMLInputElement>(null!)
  const [inputValue, setInputValue] = useState('')

  const availableOptions = useMemo(() => {
    return options.filter(option => {
      if (isMultiple) {
        if (value?.includes(option.value)) {
          return false
        }
      }

      if (inputValue.length === 0) {
        return true
      }

      return option.label.toLowerCase().includes(inputValue.toLowerCase())
    })
  }, [options, value, inputValue, isMultiple])

  const onInputChange: ChangeEventHandler<HTMLInputElement> = e => {
    setInputValue(e.target.value)
    onSearchChange?.(e.target.value)
  }

  const onSelect = (val: string) => {
    const matchingOption = options.find(option => option.value === val)
    if (!matchingOption) {
      return
    }

    if (isMultiple) {
      setInputValue('')
      onChange([...(value ?? []), matchingOption.value])
    } else {
      onChange([matchingOption.value])
      setInputValue(matchingOption.value)
    }
  }

  const onDeleteValue = (val: string) => {
    onChange(value?.filter(_val => _val !== val) ?? [])
    setInputValue('')
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

      <Combobox aria-labelledby="demo" openOnFocus onSelect={onSelect}>
        <Stack
          direction="column"
          spacing={
            value && value.length > 0 && isMultiple ? '$space80' : '$space0'
          }
        >
          <ComboboxInput
            className={isHeadless ? 'combobox-field--headless' : undefined}
            autoComplete="off"
            value={inputValue}
            onBlur={onBlur}
            placeholder={placeholder}
            id={ID}
            ref={ref}
            onChange={onInputChange}
            data-error={!!error}
          />

          {isMultiple && (
            <Stack direction="row" spacing="$space60">
              {value?.map(val => {
                const matchingOption = options.find(
                  option => option.value === val,
                )

                if (!matchingOption) {
                  return
                }

                return (
                  <SelectedOption key={matchingOption.value}>
                    <Stack
                      renderAs="span"
                      direction="row"
                      spacing="$space40"
                      alignItems="center"
                    >
                      {matchingOption.label}

                      <CloseButton
                        onClick={() => onDeleteValue(val)}
                        aria-label="Close"
                        type="button"
                      >
                        <Icon src="close" color="$gray10" size={16} />
                      </CloseButton>
                    </Stack>
                  </SelectedOption>
                )
              })}
            </Stack>
          )}
        </Stack>

        {availableOptions.length > 0 && (
          <ComboboxPopover portal={usePortal}>
            <ComboboxList>
              {availableOptions.map(({ label, value }) => (
                <ComboboxOption key={label} value={value}>
                  {label}
                </ComboboxOption>
              ))}
            </ComboboxList>
          </ComboboxPopover>
        )}
      </Combobox>

      <Message
        error={error}
        info={info}
        withPaddingTop={(value ?? []).length > 0}
      />
    </Stack>
  )
}
