import { useEffect } from 'react'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay])
}
