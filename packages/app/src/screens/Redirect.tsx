import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface RedirectProps {
  to: string
}

export const Redirect: FC<RedirectProps> = ({ to }) => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(to)
  }, [])

  return null
}
