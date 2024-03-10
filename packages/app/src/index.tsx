import React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { GlobalStyles, Toast } from './components/primitives'
import reportWebVitals from './reportWebVitals'
import './theme/fonts/index.css'
import { AuthProvider } from './auth'

document.body.innerHTML = '<div id="app"></div>'
const root = createRoot(document.getElementById('app')!)

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <GlobalStyles />
        <Toast />
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)

reportWebVitals()
