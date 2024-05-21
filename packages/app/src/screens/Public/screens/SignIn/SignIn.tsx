import { useCodeSearchParams } from '../../hooks'
import { CompleteGoogleFlow } from './components/CompleteGoogleFlow'
import { Form } from './components/Form'

export const SignIn = () => {
  const code = useCodeSearchParams()

  return code ? <CompleteGoogleFlow /> : <Form />
}
