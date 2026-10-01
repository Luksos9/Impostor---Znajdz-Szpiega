import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { initUpdater } from './utils/updater'

// New versions install in the background and are applied on the menu only
// (see utils/updater.js) — never in the middle of a round.
initUpdater()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary title="Coś poszło nie tak" onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
