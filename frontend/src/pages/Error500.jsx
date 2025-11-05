import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaRedo, FaBug, FaExclamationCircle, FaTools } from 'react-icons/fa'

function Error500() {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className='relative z-10 text-center max-w-lg mx-auto'>
        {/* Error Icon */}
        <div className='mb-8'>
          <div className='w-24 h-24 mx-auto bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30'>
            <FaBug className='text-white text-3xl' />
          </div>
        </div>

        {/* Error Code */}
        <h1 className='text-8xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4'>
          500
        </h1>

        {/* Error Message */}
        <h2 className='text-2xl font-bold text-white mb-4'>
          Server Error
        </h2>

        <p className='text-white/70 text-lg mb-8 leading-relaxed'>
          Something went wrong on our end. Our team has been notified and is working to fix the issue.
          Please try again in a few moments.
        </p>

        {/* Error Details */}
        <div className='bg-white/5 backdrop-blur-lg rounded-2xl p-4 mb-8 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <FaExclamationCircle className='text-red-400' />
            <span className='text-white font-semibold'>What happened?</span>
          </div>
          <p className='text-white/60 text-sm text-left'>
            An internal server error occurred while processing your request.
            This is usually temporary and will be resolved shortly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <button
            onClick={handleRefresh}
            className='px-6 py-3 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2'
          >
            <FaRedo className='text-sm' />
            Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 border border-white/20 flex items-center justify-center gap-2'
          >
            <FaHome className='text-sm' />
            Go Home
          </button>
        </div>

        {/* Technical Support */}
        <div className='bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10'>
          <div className='flex items-center gap-3 mb-3'>
            <FaTools className='text-blue-400' />
            <span className='text-white font-semibold'>Need Help?</span>
          </div>
          <p className='text-white/60 text-sm mb-4'>
            If this problem persists, please contact our technical support team.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className='w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
          >
            Contact Support
          </button>
        </div>

        {/* Footer */}
        <div className='mt-8 text-white/50 text-sm'>
          <p>Error ID: {Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>
    </div>
  )
}

export default Error500