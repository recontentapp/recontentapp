import { FC, useEffect } from 'react'

interface HeadProps {
  title: string
}

export const Head: FC<HeadProps> = ({ title }) => {
  useEffect(() => {
    document.title = `${title} - Recontent.app`
  }, [title])

  return null
}
