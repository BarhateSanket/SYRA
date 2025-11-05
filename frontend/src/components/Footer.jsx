import React from 'react'
import { FaShieldAlt, FaFileContract, FaCookieBite, FaLock, FaRocket } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import NewsletterSubscription from './NewsletterSubscription';

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 backdrop-blur-xl border-t border-white/20 mt-auto relative overflow-hidden'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-12 relative z-10'>
        {/* Main Footer Content */}
        <div className='grid md:grid-cols-4 gap-8 mb-12'>
          {/* Company Info */}
          <div className='md:col-span-2'>
            <div className='flex items-center gap-3 mb-6'>
              <img
                src="/logo1.png"
                alt="SYRA AI Logo"
                className='w-12 h-12 rounded-xl shadow-2xl shadow-purple-500/30 hover:scale-110 transition-transform duration-300'
              />
              <span className='text-white font-bold text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'>
                SYRA AI
              </span>
            </div>
            <p className='text-white/80 text-base leading-relaxed max-w-md mb-6'>
              Experience the future of AI-powered voice assistance. SYRA combines cutting-edge technology
              with intuitive design to deliver an unparalleled user experience.
            </p>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2 text-white/60 text-sm'>
                <FaShieldAlt className='text-green-400' />
                <span>Enterprise Security</span>
              </div>
              <div className='flex items-center gap-2 text-white/60 text-sm'>
                <FaRocket className='text-blue-400' />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className='text-white font-bold text-xl mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>Legal</h3>
            <div className='space-y-4'>
              <button
                onClick={() => navigate('/legal')}
                className='flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300 text-sm group w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                <FaShieldAlt className='text-sm group-hover:text-blue-400 transition-colors min-w-[14px]' />
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/legal')}
                className='flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300 text-sm group w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                <FaFileContract className='text-sm group-hover:text-green-400 transition-colors min-w-[14px]' />
                Terms of Service
              </button>
              <button
                onClick={() => navigate('/legal')}
                className='flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300 text-sm group w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                <FaCookieBite className='text-sm group-hover:text-orange-400 transition-colors min-w-[14px]' />
                Cookie Policy
              </button>
              <button
                onClick={() => navigate('/legal')}
                className='flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300 text-sm group w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                <FaLock className='text-sm group-hover:text-purple-400 transition-colors min-w-[14px]' />
                Data Protection
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-white font-bold text-xl mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>Quick Links</h3>
            <div className='space-y-4'>
              <button
                onClick={() => navigate('/')}
                className='block text-white/70 hover:text-white transition-all duration-300 text-sm w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                🏠 Home
              </button>
              <button
                onClick={() => navigate('/premium')}
                className='block text-yellow-400 hover:text-yellow-300 transition-all duration-300 text-sm w-full text-left p-2 rounded-lg hover:bg-yellow-400/10 hover:translate-x-1'
              >
                ⭐ Premium
              </button>
              <button
                onClick={() => navigate('/customize')}
                className='block text-white/70 hover:text-white transition-all duration-300 text-sm w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                🎨 Customize
              </button>
              <button
                onClick={() => navigate('/contact')}
                className='block text-white/70 hover:text-white transition-all duration-300 text-sm w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                📧 Contact
              </button>
              <button
                onClick={() => navigate('/history')}
                className='block text-white/70 hover:text-white transition-all duration-300 text-sm w-full text-left p-2 rounded-lg hover:bg-white/5 hover:translate-x-1'
              >
                📚 History
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <NewsletterSubscription />

        {/* Bottom Bar */}
        <div className='border-t border-white/20 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='text-white/70 text-sm text-center md:text-left'>
              © {currentYear} SYRA AI. All rights reserved. | Made with ❤️ for the future of AI
            </div>
            <div className='flex flex-wrap items-center justify-center gap-4 text-xs text-white/60'>
              <span className='flex items-center gap-1'>
                <span className='text-green-400'>●</span>
                Enterprise Security
              </span>
              <span className='flex items-center gap-1'>
                <span className='text-blue-400'>●</span>
                AI Powered
              </span>
              <span className='flex items-center gap-1'>
                <span className='text-purple-400'>●</span>
                Lightning Fast
              </span>
              <span className='flex items-center gap-1'>
                <span className='text-pink-400'>●</span>
                Premium Experience
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer