import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import UserContext from './ContextApi/UserContext.jsx'
import { ThemeProvider } from './ContextApi/ThemeContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

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
