import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './src/App'
import { ContextProvider } from './src/context'

import 'figma-ui-kit/lib/css/theme.css'
import 'figma-ui-kit/lib/css/base.css'
import 'figma-ui-kit/lib/css/menu.module.css'

ReactDOM.render(
  <ContextProvider>
    <App />
  </ContextProvider>,
  document.getElementById('root'),
)
