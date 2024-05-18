import ReactDOM from 'react-dom'
import { GlobalStyles, Toast } from 'design-system'
import { App } from './src/App'
import { ContextProvider } from './src/context'

import 'design-system/dist/styles.css'

ReactDOM.render(
  <ContextProvider>
    <GlobalStyles />
    <Toast />
    <App />
  </ContextProvider>,
  document.getElementById('root'),
)
