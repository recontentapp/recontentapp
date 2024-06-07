import { ChangeEventHandler, FC, useEffect, useRef } from 'react'

import { useId } from '../hooks/ids'
import { styled } from '../stitches'
import { customOutline } from '../theme'

interface CheckboxProps {
  size: 'medium' | 'small'
  checked: boolean
  indeterminate?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  label?: string
}

const Label = styled('label', {
  cursor: 'pointer',
  'input:focus ~ div': {
    ...customOutline,
  },
})

const Input = styled('input', {
  position: 'absolute',
  opacity: 0,
  cursor: 'pointer',
  height: 0,
  width: 0,
})

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'background-color 0.2s ease-in-out',
  backgroundColor: '$gray1',
  boxShadow: '$shadow200',
  border: '1px solid $gray6',
  color: '$gray14',
  '&:hover,&:focus': {
    backgroundColor: '$gray2',
  },
  '&:active': {
    backgroundColor: '$gray3',
  },
  variants: {
    size: {
      medium: {
        width: 20,
        height: 20,
      },
      small: {
        width: 16,
        height: 16,
        '& svg': {
          transform: 'scale(0.85)',
        },
      },
    },
    active: {
      true: {
        border: '1px solid $indigo80',
        backgroundColor: '$blue900',
        boxShadow:
          'rgb(15 15 15 / 10%) 0px 0px 0px 1px inset, rgb(15 15 15 / 10%) 0px 1px 2px',
        color: '$gray1',
        '&:hover,&:focus': {
          backgroundColor: '$blue800',
        },
        '&:active': {
          backgroundColor: '$blue700',
        },
      },
    },
  },
})

export const Checkbox: FC<CheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  size,
  label,
}) => {
  const ID = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const checkedNotIndeterminate = checked && !indeterminate

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <Label htmlFor={ID}>
      {label}
      <Input
        ref={inputRef}
        type="checkbox"
        checked={checkedNotIndeterminate}
        aria-checked={checkedNotIndeterminate}
        id={ID}
        onChange={onChange}
      />

      <Container active={checked || indeterminate} size={size}>
        {checkedNotIndeterminate && (
          <svg
            width="12"
            height="9"
            viewBox="0 0 12 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.97791 8.84136L0.159553 4.99675C-0.0531842 4.78522 -0.0531842 4.44093 0.159553 4.22715L0.930861 3.45868C1.1436 3.24716 1.48943 3.24716 1.70217 3.45868L4.36411 6.15002L10.2978 0.158645C10.5106 -0.0528816 10.8564 -0.0528816 11.0691 0.158645L11.8404 0.928241C12.0532 1.13977 12.0532 1.48519 11.8404 1.69559L4.74922 8.84136C4.53648 9.05288 4.19065 9.05288 3.97791 8.84136Z"
              fill="currentcolor"
            ></path>
          </svg>
        )}
        {indeterminate && (
          <svg
            width="12"
            height="9"
            viewBox="0 0 10 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.200195"
              y="0.0390625"
              width="9.6"
              height="1.6"
              rx="0.8"
              fill="currentcolor"
            ></rect>
          </svg>
        )}
      </Container>
    </Label>
  )
}
