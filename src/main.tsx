import ReactDOM from 'react-dom/client'
import React from 'react'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { router } from './routes/routeTree'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
