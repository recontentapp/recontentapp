import { Route, Routes } from 'react-router-dom'

import { Redirect } from '../Redirect'
import { ForgotPassword } from './screens/ForgotPassword'
import { SignIn } from './screens/SignIn/SignIn'
import { SignUp } from './screens/SignUp'

export const Public = () => (
  <Routes>
    <Route path="/sign-up" element={<SignUp />} />
    <Route path="/sign-in" element={<SignIn />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="*" element={<Redirect to="/sign-up" />} />
  </Routes>
)
