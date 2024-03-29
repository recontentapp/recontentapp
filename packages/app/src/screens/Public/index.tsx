import { Route, Routes } from 'react-router-dom'

import { Redirect } from '../Redirect'
import { toSignUp } from './routes'
import { ForgotPassword } from './screens/ForgotPassword'
import { SignIn } from './screens/SignIn'
import { SignUp } from './screens/SignUp'

export const Public = () => (
  <Routes>
    <Route path="/sign-up" element={<SignUp />} />
    <Route path="/sign-in" element={<SignIn />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="*" element={<Redirect to={toSignUp()} />} />
  </Routes>
)
