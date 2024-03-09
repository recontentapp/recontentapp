import { useRef } from 'react'

export const useFormatter = () => {
  const formatter = useRef(new Intl.NumberFormat('en'))
  return formatter.current
}
