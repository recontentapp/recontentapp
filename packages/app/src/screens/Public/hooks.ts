import { toast } from 'design-system'
import { useRef, useState } from 'react'
import { getAPIClient } from '../../generated/apiClient'

export const useCodeSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')

  return code
}

export const useGoogleSignIn = () => {
  const apiClient = useRef(
    getAPIClient({
      baseUrl: import.meta.env.VITE_APP_API_URL,
    }),
  )
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const onRequestGoogleSignIn = () => {
    setIsGoogleLoading(true)

    apiClient.current
      .getGoogleOAuthURL()
      .then(res => {
        if (!res.ok) {
          throw new Error()
        }

        window.location.href = res.data.url
      })
      .catch(() => {
        setIsGoogleLoading(false)
        toast('error', {
          title: 'Could not sign in with Google',
          description: 'Google sign in might not be available',
        })
      })
  }

  return {
    onRequestGoogleSignIn,
    isGoogleLoading,
  }
}
