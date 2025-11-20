import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../ContextApi/UserContext.jsx'
import {
  FaRocket,
  FaBrain,
  FaShieldAlt,
  FaStar,
  FaMicrophone,
  FaSearch,
  FaCloudSun,
  FaNewspaper,
  FaChartLine,
  FaExchangeAlt,
  FaRulerCombined,
  FaBell,
  FaHome,
  FaGithub,
  FaYoutube,
  FaGoogle,
  FaArrowRight
} from 'react-icons/fa'

function Welcome() {
  const { userData } = useContext(UserDataContext)
  const navigate = useNavigate()

  const handleContinue = () => {
    // If user has assistant name, go to home, else to customize
    if (userData?.assistantName) {
      navigate('/')
    } else {
      navigate('/customize')
    }
  }

  const features = [
    {
      icon: <FaMicrophone className='text-purple-400' />,
      title: 'Voice Commands',
      description: 'Control everything with your voice'
    },
    {
      icon: <FaSearch className='text-blue-400' />,
      title: 'Web Search',
      description: 'Instant Google searches and browsing'
    },
    {
      icon: <FaCloudSun className='text-green-400' />,
      title: 'Weather Updates',
      description: 'Real-time weather information'
    },
    {
      icon: <FaNewspaper className='text-yellow-400' />,
      title: 'News & Updates',
      description: 'Latest news from around the world'
    },
    {
      icon: <FaChartLine className='text-red-400' />,
      title: 'Stock Market',
      description: 'Live stock quotes and analysis'
    },
    {
      icon: <FaExchangeAlt className='text-indigo-400' />,
      title: 'Currency Exchange',
      description: 'Convert currencies instantly'
    },
    {
      icon: <FaRulerCombined className='text-pink-400' />,
      title: 'Unit Conversion',
      description: 'Convert measurements easily'
    },
    {
      icon: <FaBell className='text-orange-400' />,
      title: 'Reminders',
      description: 'Set and manage reminders'
    },
    {
      icon: <FaHome className='text-teal-400' />,
      title: 'Smart Home',
      description: 'Control your smart devices'
    },
    {
      icon: <FaGithub className='text-gray-400' />,
      title: 'GitHub Integration',
      description: 'Manage your repositories'
    },
    {
      icon: <FaYoutube className='text-red-500' />,
      title: 'YouTube',
      description: 'Search and play videos'
    },
    {
      icon: <FaGoogle className='text-blue-500' />,
      title: 'Google Services',
      description: 'Access Gmail, Calendar, Drive'
    }
  ]

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
            <span className='text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
              SYRA AI
            </span>
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col justify-center items-center p-[20px] pt-24 pb-8'>
        {/* Welcome Message */}
        <div className='text-center mb-8 relative z-20'>
          <h1 className='text-white text-[32px] sm:text-[40px] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4'>
            Welcome to SYRA AI!
          </h1>
          <p className='text-white/80 text-lg sm:text-xl max-w-2xl mx-auto'>
            Your intelligent voice assistant is ready to help you with everything
          </p>
        </div>

        {/* How to Access Section */}
        <div className='bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-6 mb-8 relative z-20 max-w-2xl mx-auto'>
          <div className="absolute inset-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl"></div>
          <div className='relative z-10'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <FaMicrophone className='text-purple-400 text-2xl' />
              <h2 className='text-white text-xl font-bold'>How to Access SYRA</h2>
            </div>
            <div className='text-center space-y-3'>
              <p className='text-white/90 text-base'>
                Simply say <span className='text-purple-400 font-semibold'>"{userData?.assistantName || 'your assistant name'}"</span> to wake me up!
              </p>
              <p className='text-white/80 text-sm'>
                I'm always listening and ready to help with voice commands
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl px-4 relative z-20 mb-8'>
          {features.map((feature, index) => (
            <div key={index} className='bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group'>
              <div className='text-2xl mb-3 group-hover:scale-110 transition-transform'>
                {feature.icon}
              </div>
              <h3 className='text-white font-semibold text-sm mb-1'>{feature.title}</h3>
              <p className='text-white/60 text-xs'>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* What SYRA Helps With */}
        <div className='bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-6 mb-8 relative z-20 max-w-4xl mx-auto'>
          <div className="absolute inset-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl"></div>
          <div className='relative z-10'>
            <div className='flex items-center justify-center gap-3 mb-6'>
              <FaBrain className='text-blue-400 text-2xl' />
              <h2 className='text-white text-xl font-bold'>What SYRA Can Help You With</h2>
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-white font-semibold mb-3 flex items-center gap-2'>
                  <FaRocket className='text-purple-400' />
                  Productivity & Apps
                </h3>
                <ul className='text-white/80 text-sm space-y-2'>
                  <li>• Open websites and applications instantly</li>
                  <li>• Search the web and get instant results</li>
                  <li>• Manage your emails and calendar</li>
                  <li>• Access Google Drive and Docs</li>
                </ul>
              </div>
              <div>
                <h3 className='text-white font-semibold mb-3 flex items-center gap-2'>
                  <FaShieldAlt className='text-green-400' />
                  Information & Utilities
                </h3>
                <ul className='text-white/80 text-sm space-y-2'>
                  <li>• Get weather updates and forecasts</li>
                  <li>• Stay updated with latest news</li>
                  <li>• Check stock prices and market data</li>
                  <li>• Convert currencies and measurements</li>
                </ul>
              </div>
              <div>
                <h3 className='text-white font-semibold mb-3 flex items-center gap-2'>
                  <FaHome className='text-teal-400' />
                  Smart Living
                </h3>
                <ul className='text-white/80 text-sm space-y-2'>
                  <li>• Set reminders and manage tasks</li>
                  <li>• Control smart home devices</li>
                  <li>• Play music and videos</li>
                  <li>• Manage your GitHub repositories</li>
                </ul>
              </div>
              <div>
                <h3 className='text-white font-semibold mb-3 flex items-center gap-2'>
                  <FaStar className='text-pink-400' />
                  Premium Features
                </h3>
                <ul className='text-white/80 text-sm space-y-2'>
                  <li>• Advanced analytics and insights</li>
                  <li>• Priority support and features</li>
                  <li>• Enhanced security options</li>
                  <li>• Unlimited usage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className='bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 relative z-20'
        >
          Get Started
          <FaArrowRight className='text-sm' />
        </button>

        {/* Footer Note */}
        <p className='text-white/60 text-sm text-center mt-4 relative z-20 max-w-md'>
          Ready to experience the future of AI assistance? Let's begin your journey with SYRA!
        </p>
      </div>
    </div>
  )
}

export default Welcome