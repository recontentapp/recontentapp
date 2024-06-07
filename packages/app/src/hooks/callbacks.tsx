import { toast } from 'design-system'
import queryString from 'query-string'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCurrentUser } from '../auth'
import { FullpageSpinner } from '../components/FullpageSpinner'
import { useInstallGithubApp } from '../generated/reactQuery'

export const CallbacksProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const { accounts } = useCurrentUser()
  const [processingOAuth, setProcessingOAuth] = useState(false)
  const { mutateAsync: installGithubApp } = useInstallGithubApp()

  useEffect(() => {
    if (processingOAuth) {
      return
    }

    const { query } = queryString.parseUrl(location.search)

    // Github app installation callback signature
    if (query.installation_id) {
      const { installation_id, state } = query
      const workspaceAccount = accounts.find(
        account => account.workspace.id === state,
      )

      if (!state || !workspaceAccount) {
        toast('error', {
          title: 'Could not install GitHub app',
          description:
            'Please start the installation process from workspace integrations settings.',
        })
        return
      }

      setProcessingOAuth(true)

      installGithubApp({
        body: {
          installationId: Number(installation_id),
          workspaceId: String(state),
        },
      })
        .then(() => {
          toast('success', {
            title: 'Github app installed',
            description: `You can now create GitHub destinations for ${workspaceAccount.workspace.name}`,
          })
        })
        .catch(() => {
          toast('error', {
            title: 'Could not install GitHub app',
          })
        })
        .finally(() => {
          setProcessingOAuth(false)
        })
    }
  }, [location.search])

  if (processingOAuth) {
    return <FullpageSpinner variation="primary" />
  }

  return children
}
