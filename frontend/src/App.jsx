import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Customize from './pages/customize'
import { userDataContext } from './ContextApi/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/customize2'
import Premium from './pages/Premium'
import Legal from './pages/Legal'
import Contact from './pages/Contact'
import History from './pages/History'
import PaymentMethod from './pages/PaymentMethod'
import AddPaymentMethod from './pages/AddPaymentMethod'

function App() {
  const { userData, setUserData } = useContext(userDataContext)
   return (
   <Routes>
     <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
    <Route path='/signup' element={!userData?<Signup/>:<Navigate to={"/"}/>}/>
     <Route path='/signin' element={!userData?<Signin/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
       <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
       <Route path='/premium' element={userData?<Premium/>:<Navigate to={"/signin"}/>}/>
       <Route path='/payment-method' element={userData?<PaymentMethod/>:<Navigate to={"/signin"}/>}/>
       <Route path='/add-payment-method' element={userData?<AddPaymentMethod/>:<Navigate to={"/signin"}/>}/>
       <Route path='/legal' element={<Legal/>}/>
       <Route path='/contact' element={<Contact/>}/>
       <Route path='/history' element={userData?<History/>:<Navigate to={"/signin"}/>}/>
   </Routes>
  )
}

export default App
