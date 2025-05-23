import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import './index.css'
import { store } from './redux/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    <Toaster position="top-center" richColors />
    </Provider>
  </StrictMode>,
)
