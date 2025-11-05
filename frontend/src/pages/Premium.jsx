import React from 'react'
import { FaRocket, FaBrain, FaShieldAlt, FaStar, FaCrown, FaCheck, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Premium() {
  const navigate = useNavigate();

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative'>
      <Header />
      <div className='flex-1 flex justify-center items-center flex-col p-[20px] sm:p-[40px] pt-24'>
      {/* Enhanced Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Premium Header */}
      <div className='absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-yellow-400/20 shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg shadow-lg'>
              <FaRocket className='text-white text-xl' />
            </div>
            <span className='text-white font-bold text-xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent'>SYRA Premium</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className='flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 border border-white/20 hover:border-white/40 shadow-md hover:shadow-lg'
          >
            <FaArrowLeft />
            <span className='font-medium'>Back to Home</span>
          </button>
        </div>
      </div>

      <div className='w-full max-w-7xl relative z-20 mt-24 sm:mt-32'>
        {/* Hero Section */}
        <div className='text-center mb-16 sm:mb-20'>
          <div className='flex justify-center mb-8'>
            <div className='bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-6 rounded-2xl shadow-2xl animate-pulse'>
              <FaCrown className='text-white text-5xl drop-shadow-lg' />
            </div>
          </div>
          <h1 className='text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight'>
            SYRA Premium
          </h1>
          <p className='text-white/90 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light'>
            Unlock the full potential of AI-powered voice assistance with advanced features and unlimited access
          </p>
        </div>

        {/* Pricing Card */}
        <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-yellow-400/30 shadow-2xl relative overflow-hidden mb-16 hover:shadow-yellow-400/20 transition-all duration-500'>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-400/10 to-transparent rounded-3xl"></div>

          <div className='relative z-10 text-center'>
            <div className='flex items-center justify-center gap-3 mb-6'>
              <FaStar className='text-yellow-400 text-3xl animate-pulse' />
              <span className='text-white text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent'>Premium Plan</span>
              <FaStar className='text-yellow-400 text-3xl animate-pulse' />
            </div>

            <div className='mb-8'>
              <span className='text-6xl sm:text-7xl font-bold text-white drop-shadow-lg'>$9.99</span>
              <div className='text-white/70 text-xl font-light'>/month</div>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
              <button
                onClick={() => navigate('/payment-method')}
                className='w-full max-w-sm bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-5 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-400/50'
              >
                Upgrade to Premium
              </button>
              <div className='text-white/60 text-sm'>✨ 7-day free trial</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16'>
          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-purple-400/50 hover:bg-white/15 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-400/20 hover:scale-105'>
            <div className='text-purple-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaRocket /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Unlimited Commands</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed'>Execute unlimited voice commands without any restrictions or limitations.</p>
            <div className='flex items-center gap-2 mt-6'>
              <FaCheck className='text-green-400 text-lg' />
              <span className='text-green-400 text-sm font-semibold'>Premium Feature</span>
            </div>
          </div>

          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transition-all duration-500 group hover:shadow-2xl hover:shadow-blue-400/20 hover:scale-105'>
            <div className='text-blue-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaBrain /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Advanced AI Responses</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed'>Get more intelligent and context-aware responses from our enhanced AI model.</p>
            <div className='flex items-center gap-2 mt-6'>
              <FaCheck className='text-green-400 text-lg' />
              <span className='text-green-400 text-sm font-semibold'>Premium Feature</span>
            </div>
          </div>

          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-green-400/50 hover:bg-white/15 transition-all duration-500 group hover:shadow-2xl hover:shadow-green-400/20 hover:scale-105'>
            <div className='text-green-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaShieldAlt /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Priority Support</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed'>Get instant support and help from our dedicated premium support team.</p>
            <div className='flex items-center gap-2 mt-6'>
              <FaCheck className='text-green-400 text-lg' />
              <span className='text-green-400 text-sm font-semibold'>Premium Feature</span>
            </div>
          </div>

          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-pink-400/50 hover:bg-white/15 transition-all duration-500 group hover:shadow-2xl hover:shadow-pink-400/20 hover:scale-105'>
            <div className='text-pink-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaStar /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Custom Voice Training</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed'>Train the AI to recognize your voice patterns and preferences better.</p>
            <div className='flex items-center gap-2 mt-6'>
              <FaCheck className='text-green-400 text-lg' />
              <span className='text-green-400 text-sm font-semibold'>Premium Feature</span>
            </div>
          </div>

          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-yellow-400/50 hover:bg-white/15 transition-all duration-500 group hover:shadow-2xl hover:shadow-yellow-400/20 hover:scale-105'>
            <div className='text-yellow-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaCrown /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Exclusive Integrations</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed'>Access premium integrations with top productivity and entertainment apps.</p>
            <div className='flex items-center gap-2 mt-6'>
              <FaCheck className='text-green-400 text-lg' />
              <span className='text-green-400 text-sm font-semibold'>Premium Feature</span>
            </div>
          </div>

          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-orange-400/50 hover:bg-white/15 transition-all duration-500 group hover:shadow-2xl hover:shadow-orange-400/20 hover:scale-105'>
            <div className='text-orange-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaRocket /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Advanced Analytics</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed'>Get detailed insights and analytics about your voice command usage patterns.</p>
            <div className='flex items-center gap-2 mt-6'>
              <FaCheck className='text-green-400 text-lg' />
              <span className='text-green-400 text-sm font-semibold'>Premium Feature</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='text-center bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-pink-400/10 rounded-3xl p-8 sm:p-12 border border-yellow-400/20'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-6'>Ready to Go Premium?</h2>
          <p className='text-white/90 text-lg sm:text-xl mb-10 max-w-3xl mx-auto leading-relaxed'>
            Join thousands of users who have upgraded to SYRA Premium for the ultimate AI voice assistant experience.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <button
              onClick={() => navigate('/payment-method')}
              className='bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-5 px-16 rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-400/50'
            >
              Start Premium Trial
            </button>
            <div className='text-white/60 text-sm sm:text-base flex items-center gap-2'>
              <FaShieldAlt className='text-green-400' />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>
  )
}

export default Premium