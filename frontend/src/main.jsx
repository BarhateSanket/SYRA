import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import UserContext from './ContextApi/UserContext.jsx'
import { ThemeProvider } from './ContextApi/ThemeContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')).render(
<BrowserRouter>
<ThemeProvider>
<UserContext>
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <App />
    </main>
    <Footer />
  </div>
  </UserContext>
  </ThemeProvider>
  </BrowserRouter>

)
