import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaArrowLeft, FaSearch, FaExclamationTriangle } from 'react-icons/fa'

function Error404() {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className='relative z-10 text-center max-w-md mx-auto'>
        {/* Error Icon */}
        <div className='mb-8'>
          <div className='w-24 h-24 mx-auto bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30'>
            <FaExclamationTriangle className='text-white text-3xl' />
          </div>
        </div>

        {/* Error Code */}
        <h1 className='text-8xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4'>
          404
        </h1>

        {/* Error Message */}
        <h2 className='text-2xl font-bold text-white mb-4'>
          Page Not Found
        </h2>

        <p className='text-white/70 text-lg mb-8 leading-relaxed'>
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <button
            onClick={() => navigate('/')}
            className='px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2'
          >
            <FaHome className='text-sm' />
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 border border-white/20 flex items-center justify-center gap-2'
          >
            <FaArrowLeft className='text-sm' />
            Go Back
          </button>
        </div>

        {/* Search Suggestion */}
        <div className='bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10'>
          <div className='flex items-center gap-3 mb-3'>
            <FaSearch className='text-purple-400' />
            <span className='text-white font-semibold'>Try searching for:</span>
          </div>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            {['Home', 'Premium', 'Contact', 'Legal'].map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/${item.toLowerCase()}`)}
                className='text-white/70 hover:text-purple-400 transition-colors text-left'
              >
                • {item}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-white/50 text-sm'>
          <p>If you believe this is an error, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
}

export default Error404