import { RefObject, useEffect } from 'react'

export const useOutsideClick = (
  ref: RefObject<HTMLDivElement>,
  onOutsideClick: (event: Event) => void,
) => {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick(event)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, onOutsideClick])
}
