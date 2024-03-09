import React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { GlobalStyles, Toast } from './components/primitives'
import reportWebVitals from './reportWebVitals'
import './theme/fonts/index.css'

document.body.innerHTML = '<div id="app"></div>'
const root = createRoot(document.getElementById('app')!)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStyles />
      <Toast />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

reportWebVitals()
