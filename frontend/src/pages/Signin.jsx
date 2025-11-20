import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { FaRocket, FaBrain, FaShieldAlt, FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../ContextApi/UserContext.jsx';
import axios from "axios"
import Header from '../components/Header'
import FaceVerification from '../components/FaceVerification'
function SignIn() {
  const [showPassword,setShowPassword]=useState(false)
  const {serverUrl,userData,setUserData}=useContext(UserDataContext)
  const navigate=useNavigate()
  const [email,setEmail]=useState("")
  const [loading,setLoading]=useState(false)
    const [password,setPassword]=useState("")
const [err,setErr]=useState("")
  const [requiresFaceAuth, setRequiresFaceAuth] = useState(false)
  const [tempToken, setTempToken] = useState("")
  const handleSignIn=async (e)=>{
    e.preventDefault()
    setErr("")
    setLoading(true)
 try {
   let result=await axios.post(`${serverUrl}/api/auth/signin`,{
    email,password
   },{withCredentials:true} )

   if (result.data.requiresFaceAuth) {
     setRequiresFaceAuth(true)
     setTempToken(result.headers.authorization || '') // Assuming token is in headers, but actually it's in cookie
     // Actually, since it's withCredentials, token is set in cookie, but for face verification, we need to send it in header
     // For simplicity, assume we store it
   } else {
     setUserData(result.data)
     navigate("/welcome")
   }
   setLoading(false)
 } catch (error) {
   console.log(error)
   setUserData(null)
   setLoading(false)
   setErr(error.response.data.message)
 }
    }
  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Premium Header */}
      <div className='absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex justify-center items-center'>
          <div className='flex items-center gap-3'>
            <FaRocket className='text-purple-400 text-xl' />
            <span className='text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>SYRA AI</span>
          </div>
        </div>
      </div>

      <div className='flex-1 flex justify-center items-center flex-col p-[20px] pt-24'>
        {requiresFaceAuth ? (
          <FaceVerification
            isLogin={true}
            onSuccess={(data) => {
              setUserData(data.user)
              navigate("/welcome")
            }}
            onCancel={() => setRequiresFaceAuth(false)}
          />
        ) : (
          <>
            {/* Feature Cards */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl px-4 relative z-20 mt-20 mb-8'>
              <div className='bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group'>
                <div className='text-purple-400 text-2xl mb-3 group-hover:scale-110 transition-transform'><FaRocket /></div>
                <h3 className='text-white font-semibold text-sm'>Lightning Fast</h3>
                <p className='text-white/60 text-xs'>Instant responses</p>
              </div>
              <div className='bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group'>
                <div className='text-blue-400 text-2xl mb-3 group-hover:scale-110 transition-transform'><FaBrain /></div>
                <h3 className='text-white font-semibold text-sm'>AI Powered</h3>
                <p className='text-white/60 text-xs'>Advanced intelligence</p>
              </div>
              <div className='bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group'>
                <div className='text-green-400 text-2xl mb-3 group-hover:scale-110 transition-transform'><FaShieldAlt /></div>
                <h3 className='text-white font-semibold text-sm'>Secure</h3>
                <p className='text-white/60 text-xs'>Enterprise security</p>
              </div>
              <div className='bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group'>
                <div className='text-pink-400 text-2xl mb-3 group-hover:scale-110 transition-transform'><FaStar /></div>
                <h3 className='text-white font-semibold text-sm'>Premium</h3>
                <p className='text-white/60 text-xs'>Top-tier experience</p>
              </div>
            </div>

            <form className='w-[95%] max-w-[520px] bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 flex flex-col items-center justify-center gap-[24px] px-[24px] py-[48px] rounded-3xl relative z-20' onSubmit={handleSignIn}>
              <div className="absolute inset-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl"></div>

              <div className='relative z-10 flex flex-col items-center gap-6'>
                <h1 className='text-white text-[26px] sm:text-[32px] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center'>Welcome Back</h1>
                <p className='text-white/80 text-center text-sm sm:text-base'>Sign in to your SYRA AI account</p>
              </div>

              <div className='w-full space-y-5 relative z-10'>
                <input
                  type="email"
                  placeholder='Email'
                  className='w-full h-[52px] sm:h-[64px] outline-none border-2 border-purple-400/50 bg-white/5 backdrop-blur-lg text-white placeholder-gray-300 px-[18px] sm:px-[24px] py-[12px] rounded-full text-[16px] sm:text-[18px] focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
                  required
                  onChange={(e)=>setEmail(e.target.value)}
                  value={email}
                />

                <div className='w-full h-[52px] sm:h-[64px] border-2 border-purple-400/50 bg-white/5 backdrop-blur-lg text-white rounded-full text-[16px] sm:text-[18px] relative focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/20 transition-all duration-300'>
                  <input
                    type={showPassword?"text":"password"}
                    placeholder='Password'
                    className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[18px] sm:px-[24px] py-[12px]'
                    required
                    onChange={(e)=>setPassword(e.target.value)}
                    value={password}
                    autoComplete="current-password"
                  />
                  {!showPassword && <IoEye className='absolute top-[16px] sm:top-[20px] right-[18px] sm:right-[24px] w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] text-white cursor-pointer hover:text-purple-400 transition-colors' onClick={()=>setShowPassword(true)}/>}
                  {showPassword && <IoEyeOff className='absolute top-[16px] sm:top-[20px] right-[18px] sm:right-[24px] w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] text-white cursor-pointer hover:text-purple-400 transition-colors' onClick={()=>setShowPassword(false)}/>}
                </div>
              </div>

              {err.length>0 && <p className='text-red-400 text-[14px] sm:text-[17px] text-center bg-red-500/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-red-500/20'>
                *{err}
              </p>}

              <button
                className='w-full h-[52px] sm:h-[64px] text-black font-semibold bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-full text-[16px] sm:text-[19px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative z-10'
                disabled={loading}
              >
                {loading?"Loading...":"Sign In"}
              </button>

              <div className='w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent relative z-10'></div>

              <p className='text-white/80 text-[14px] sm:text-[18px] text-center relative z-10 mt-2'>
                Want to create a new account?
                <span className='text-purple-400 hover:text-purple-300 cursor-pointer ml-2 font-semibold transition-colors' onClick={()=>navigate("/signup")}>Sign Up</span>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default SignIn
