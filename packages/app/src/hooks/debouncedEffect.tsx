import { useEffect, useRef, useState } from 'react'

import { useUpdate } from './update'

export const useDebouncedEffect = (
  effect: () => void,
  deps: unknown[],
  delay: number,
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay)

    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay])
}

export const useDebouncedUpdate = (
  effect: () => void,
  deps: unknown[],
  delay: number,
) => {
  useUpdate(() => {
    const handler = setTimeout(() => effect(), delay)

    return () => clearTimeout(handler)
  }, [...(deps || []), delay])
}

export function useDebouncedValue<T = any>(
  value: T,
  wait: number,
  options = { leading: false },
) {
  const [_value, setValue] = useState(value)
  const mountedRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const cooldownRef = useRef(false)

  const cancel = () => window.clearTimeout(timeoutRef.current!)

  useEffect(() => {
    if (mountedRef.current) {
      if (!cooldownRef.current && options.leading) {
        cooldownRef.current = true
        setValue(value)
      } else {
        cancel()
        timeoutRef.current = window.setTimeout(() => {
          cooldownRef.current = false
          setValue(value)
        }, wait)
      }
    }
  }, [value, options.leading, wait])

  useEffect(() => {
    mountedRef.current = true
    return cancel
  }, [])

  return [_value, cancel] as const
}
