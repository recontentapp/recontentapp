import { ReactNode } from 'react'

export interface FieldProps {
  label: string
  hideLabel?: boolean
  autoFocus?: boolean
  id?: string
  name?: string
  placeholder?: string
  hint?: string
  info?: ReactNode
  error?: ReactNode
  isOptional?: boolean
  isDisabled?: boolean
  onBlur?: (event: any) => void
}

export interface Option {
  label: string
  value: string
}
