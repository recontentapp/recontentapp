import { useEffect, useState } from 'react'

import { TextField } from 'design-system'

interface SearchProps {
  initialValue: string | undefined
  onChange: (value: string) => void
  debounce?: number
}

export const Search = ({
  initialValue,
  onChange,
  debounce = 300,
}: SearchProps) => {
  const [value, setValue] = useState(initialValue ?? '')

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <TextField
      placeholder="Search key..."
      label="Search"
      value={value}
      hideLabel
      onChange={value => setValue(value)}
    />
  )
}
