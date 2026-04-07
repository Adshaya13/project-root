import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './App.css'
import App from './App.tsx'
import { GOOGLE_CLIENT_ID } from '@/utils/env'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'missing-google-client-id'}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
