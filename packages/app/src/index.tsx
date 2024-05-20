import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GlobalStyles, Toast } from 'design-system'

import 'design-system/dist/styles.css'
import './theme/fonts/index.css'

import { App } from './App'
import { SystemProvider } from './hooks/system'
import reportWebVitals from './reportWebVitals'
import { AuthProvider } from './auth'

document.body.innerHTML = '<div id="app"></div>'
const root = createRoot(document.getElementById('app')!)

root.render(
  <React.StrictMode>
    <SystemProvider>
      <AuthProvider>
        <BrowserRouter>
          <GlobalStyles />
          <Toast />
          <App />
        </BrowserRouter>
      </AuthProvider>
    </SystemProvider>
  </React.StrictMode>,
)

reportWebVitals()
