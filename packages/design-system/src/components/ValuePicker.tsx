import { useId } from '../hooks/ids'
import { styled } from '../stitches'
import { Box } from './Box'

interface Option<T> {
  label: string
  value: T
}

interface ValuePickerProps<T> {
  options: Option<T>[]
  onChange: (value: T) => void
  value: T
}

const Container = styled('ul', {
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: '$gray1',
  boxShadow: '$shadow200',
  borderRadius: '$radius200',
  border: '1px solid $gray6',
  color: '$gray14',
  '& li:first-child span': {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  '& li:last-child span': {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  '& li:not(:last-child)': {
    borderRight: '1px solid $gray6',
  },
  '&:hover,&:focus': {
    backgroundColor: '$gray2',
  },
  '&:active': {
    backgroundColor: '$gray3',
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
  variants: {
    isDisabled: {
      true: {
        cursor: 'not-allowed',
        color: '$gray10 !important',
        boxShadow: 'none !important',
        border: '1px solid $gray5 !important',
        outline: 'none !important',
        backgroundColor: '$gray5 !important',
      },
    },
  },
})

const Option = styled('span', {
  display: 'inline-block',
  paddingX: '$space80',
  paddingY: '$space40',
  outline: 'none',
  color: '$gray14',
  fontWeight: 500,
  fontSize: '$size80',
  transition: 'background-color 0.2s ease-in-out',
  cursor: 'pointer',
  '&[aria-checked="true"]': {
    backgroundColor: '$blue900',
    color: '$gray1',
  },
  '&:hover,&:focus': {
    color: '$gray1',
    backgroundColor: '$blue800',
  },
})

export const ValuePicker = <T extends string>({
  options,
  onChange,
  value,
}: ValuePickerProps<T>) => {
  return (
    <Box>
      <Container role="radiogroup" aria-labelledby="legend25">
        {options.map(option => {
          const id = useId()
          return (
            <li key={option.value}>
              <label id={id}>
                <Option
                  role="radio"
                  onClick={() => onChange(option.value)}
                  onKeyDown={e => {
                    if (e.key !== 'Enter') {
                      return
                    }

                    onChange(option.value)
                  }}
                  aria-checked={option.value === value}
                  tabIndex={0}
                  aria-labelledby={id}
                  data-value={option.value}
                >
                  {option.label}
                </Option>
              </label>
            </li>
          )
        })}
      </Container>
    </Box>
  )
}
