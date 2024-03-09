import { CSSProperties, FC } from 'react'
import DatePicker from 'react-datepicker'

import { useId } from '../../../hooks/ids'
import { globalCss } from '../../../theme'
import { Stack } from '../Stack'
import { Label } from './components/Label'
import { Message } from './components/Message'
import { FieldProps } from './types'

export const globalStyles = globalCss({
  '.react-datepicker': {
    borderColor: '$gray7 !important',
    boxShadow: '$shadow300',
    '.react-datepicker__header': {
      backgroundColor: '$gray3',
      borderColor: '$gray7',
    },
    '.react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header':
      {
        color: '$gray14',
      },
    '.react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name':
      {
        color: '$gray14',
      },
    '.react-datepicker__year-read-view--down-arrow, .react-datepicker__month-read-view--down-arrow, .react-datepicker__month-year-read-view--down-arrow, .react-datepicker__navigation-icon::before':
      {
        borderColor: '$gray9',
      },
    '.react-datepicker__navigation:hover *::before': {
      borderColor: '$gray11',
    },
    '.react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__quarter-text:hover, .react-datepicker__year-text:hover':
      {
        backgroundColor: '$gray4',
      },
    '.react-datepicker__day--keyboard-selected, .react-datepicker__month-text--keyboard-selected, .react-datepicker__quarter-text--keyboard-selected, .react-datepicker__year-text--keyboard-selected':
      {
        backgroundColor: '$blue900',
        color: '$white',
        transition: 'background-color 0.1s ease-in-out',
        '&:hover': {
          backgroundColor: '$blue800',
        },
      },
    '.react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range, .react-datepicker__month-text--selected, .react-datepicker__month-text--in-selecting-range, .react-datepicker__month-text--in-range, .react-datepicker__quarter-text--selected, .react-datepicker__quarter-text--in-selecting-range, .react-datepicker__quarter-text--in-range, .react-datepicker__year-text--selected, .react-datepicker__year-text--in-selecting-range, .react-datepicker__year-text--in-range':
      {
        backgroundColor: '$blue900',
        color: '$white',
        transition: 'background-color 0.1s ease-in-out',
        '&:hover': {
          backgroundColor: '$blue800',
        },
      },
  },
  '.react-datepicker-wrapper': {
    '.react-datepicker__input-container input': {
      width: '100%',
      backgroundColor: '$white',
      border: '1px solid $gray7',
      borderRadius: '$radius200',
      outline: 'none',
      paddingX: '$space80',
      paddingY: '$space60',
      fontSize: '$size80',
      boxShadow: '$shadow100',
      transition: 'all 0.06s ease-in-out',
      variants: {
        variation: {
          error: {
            outlineColor: '$red200',
            outlineOffset: -0.6,
            outlineStyle: 'auto',
            outlineWidth: 2,
            boxShadow:
              'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
          },
        },
      },
      '&:focus': {
        outlineColor: '$blue900',
        outlineOffset: -0.6,
        outlineStyle: 'auto',
        outlineWidth: 2,
        boxShadow:
          'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
      },
    },
  },
})

interface DateFieldProps
  extends FieldProps,
    Pick<CSSProperties, 'maxWidth' | 'width'> {
  onChange: (value: Date | null) => void
  value?: Date
  minValue?: Date
  maxValue?: Date
}

export const DateField: FC<DateFieldProps> = ({
  label,
  hideLabel = false,
  autoFocus = false,
  placeholder,
  onChange,
  onBlur,
  value,
  minValue,
  maxValue,
  error,
  info,
  id,
  name,
  hint,
  isOptional,
  ...props
}) => {
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

      <DatePicker
        closeOnScroll
        showPopperArrow={false}
        autoFocus={autoFocus}
        name={name}
        selected={value}
        onBlur={onBlur}
        minDate={minValue}
        maxDate={maxValue}
        placeholderText={placeholder}
        onChange={date => onChange(date)}
        dateFormat="dd/MM/yyyy"
      />

      <Message error={error} info={info} />
    </Stack>
  )
}
