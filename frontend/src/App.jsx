import React, { useContext, useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserDataContext } from './ContextApi/UserContext.jsx'
import usePushNotifications from './hooks/usePushNotifications'

// Lazy load components
const Signup = lazy(() => import('./pages/Signup'))
const Signin = lazy(() => import('./pages/Signin'))
const Welcome = lazy(() => import('./pages/Welcome'))
const Customize = lazy(() => import('./pages/customize'))
const Home = lazy(() => import('./pages/Home'))
const Customize2 = lazy(() => import('./pages/customize2'))
const Premium = lazy(() => import('./pages/Premium'))
const Legal = lazy(() => import('./pages/Legal'))
const Contact = lazy(() => import('./pages/Contact'))
const History = lazy(() => import('./pages/History'))
const PaymentMethod = lazy(() => import('./pages/PaymentMethod'))
const AddPaymentMethod = lazy(() => import('./pages/AddPaymentMethod'))
const Analytics = lazy(() => import('./pages/Analytics'))
const YouTubeDownloader = lazy(() => import('./pages/YouTubeDownloader'))

function App() {
  const { userData, setUserData } = useContext(UserDataContext)
  const { isSupported, permission, subscribe } = usePushNotifications()

  useEffect(() => {
    if (userData && isSupported && permission === 'granted') {
      subscribe()
    }
  }, [userData, isSupported, permission, subscribe])

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Routes>
        <Route
          path='/'
          element={
            userData?.assistantName
              ? <Home />
              : <Navigate to="/customize" />
          }
        />

        <Route path='/signup' element={!userData ? <Signup /> : <Navigate to="/" />} />
        <Route path='/signin' element={!userData ? <Signin /> : <Navigate to="/" />} />
        <Route path='/welcome' element={userData ? <Welcome /> : <Navigate to="/signup" />} />
        <Route path='/customize' element={userData ? <Customize /> : <Navigate to="/signup" />} />
        <Route path='/customize2' element={userData ? <Customize2 /> : <Navigate to="/signup" />} />
        <Route path='/premium' element={userData ? <Premium /> : <Navigate to="/signin" />} />
        <Route path='/payment-method' element={userData ? <PaymentMethod /> : <Navigate to="/signin" />} />
        <Route path='/add-payment-method' element={userData ? <AddPaymentMethod /> : <Navigate to="/signin" />} />
        <Route path='/legal' element={<Legal />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/history' element={userData ? <History /> : <Navigate to="/signin" />} />
        <Route path='/analytics' element={userData ? <Analytics /> : <Navigate to="/signin" />} />
        <Route path='/youtube-downloader' element={userData ? <YouTubeDownloader /> : <Navigate to="/signin" />} />
      </Routes>
    </Suspense>
  )
}

export default App
