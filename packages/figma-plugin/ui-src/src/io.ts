import { useCallback, useEffect } from 'react'

export const useEmit = <Emittable>() => {
  const emit = useCallback((data: Emittable) => {
    parent.postMessage(
      {
        pluginMessage: data,
      },
      '*',
    )
  }, [])

  return emit
}

export const useOn = <Receivable extends string>(
  settings: Partial<Record<Receivable, (message: any) => void>>,
) => {
  const onMessage = useCallback((event: MessageEvent<any>) => {
    const message = event.data.pluginMessage
    const handler = settings[message.type as Receivable]
    handler?.(message)
  }, [])

  useEffect(() => {
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])
}
