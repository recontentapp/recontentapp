import { EffectCallback, useEffect, useRef } from 'react'

export const useUpdate = (
  effect: EffectCallback,
  deps: any[],
  applyChanges = true,
) => {
  const isInitialMount = useRef(true)

  useEffect(
    isInitialMount.current || !applyChanges
      ? () => {
          isInitialMount.current = false
        }
      : effect,
    deps,
  )
}
