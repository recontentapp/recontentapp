import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

import { Redirect } from '../Redirect'
import { toYou } from './routes'
import { CreateWorkspace } from './screens/CreateWorkspace'
import { JoinWorkspace } from './screens/JoinWorkspace'
import { You } from './screens/You'
import { useCurrentUser } from '../../auth'

export const Onboarding = () => {
  const { firstName, lastName } = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (firstName.length === 0 || lastName.length === 0) {
      navigate(toYou())
    }
  }, [firstName, lastName])

  return (
    <Routes>
      <Route path="onboarding">
        <Route path="you" element={<You />} />
        <Route path="create-workspace" element={<CreateWorkspace />} />
        <Route path="join-workspace" element={<JoinWorkspace />} />
      </Route>
      <Route path="*" element={<Redirect to={toYou()} />} />
    </Routes>
  )
}
