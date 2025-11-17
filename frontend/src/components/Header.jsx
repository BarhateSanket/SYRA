import React, { useContext, useState, useRef, useEffect } from 'react'
import { FaRocket, FaBars, FaTimes, FaHome, FaInfo, FaServicestack, FaEnvelope, FaUser, FaSignOutAlt, FaBrain, FaStar, FaShieldAlt, FaHistory, FaChevronDown, FaCog, FaUserCircle, FaCreditCard, FaChartBar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../ContextApi/UserDataContext';
import ThemeToggle from './ThemeToggle';

function Header() {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(userDataContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogOut = async () => {
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL || 'https://syra-jaeg.onrender.com'}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black/30 via-purple-900/20 to-black/30 dark:from-black/30 dark:via-purple-900/20 dark:to-black/30 light:from-white/30 light:via-purple-100/20 light:to-white/30 backdrop-blur-xl border-b border-white/20 dark:border-white/20 light:border-gray-300/50 shadow-2xl shadow-purple-500/10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div
            className='flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-300'
            onClick={() => navigate('/')}
          >
            <img
              src="/logo1.png"
              alt="SYRA AI Logo"
              className='w-10 h-10 rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105'
            />
            <span className='text-white dark:text-white light:text-gray-800 font-bold text-xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent hover:from-purple-300 hover:via-pink-300 hover:to-purple-500 transition-all duration-300'>
              SYRA AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            <button
              onClick={() => navigate('/')}
              className='text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <FaHome className='text-sm' />
              Home
            </button>

            <button
              onClick={() => navigate('/legal')}
              className='text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <FaShieldAlt className='text-sm' />
              Legal
            </button>
            <button
              onClick={() => navigate('/contact')}
              className='text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <FaEnvelope className='text-sm' />
              Contact
            </button>
            <button
              onClick={() => navigate('/history')}
              className='text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <FaHistory className='text-sm' />
              History
            </button>
            <button
              onClick={() => navigate('/payment-method')}
              className='text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <FaCreditCard className='text-sm' />
              Payment Methods
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {userData && (
              <div className='flex items-center space-x-4 ml-4 pl-4 border-l border-white/20'>
                <button
                  onClick={() => navigate('/customize')}
                  className='text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-800/10 transform hover:scale-105'
                >
                  <FaBrain className='text-sm animate-bounce' />
                  Customize
                </button>

                {/* Profile Dropdown */}
                <div className='relative' ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className='flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10'
                  >
                    <div className='w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center'>
                      <FaUserCircle className='text-white text-sm' />
                    </div>
                    <span className='hidden lg:block'>{userData.name}</span>
                    <FaChevronDown className={`text-sm transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className='absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50'>
                      <div className='p-4 border-b border-white/10'>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center'>
                            <FaUserCircle className='text-white text-lg' />
                          </div>
                          <div>
                            <p className='text-white font-semibold'>{userData.name}</p>
                            <p className='text-white/60 text-sm'>{userData.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className='py-2'>
                        <button
                          onClick={() => { navigate('/'); setIsProfileOpen(false); }}
                          className='w-full text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaHome className='text-sm' />
                          Dashboard
                        </button>

                        <button
                          onClick={() => { navigate('/customize'); setIsProfileOpen(false); }}
                          className='w-full text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaBrain className='text-sm' />
                          Customize Assistant
                        </button>

                        <button
                          onClick={() => { navigate('/history'); setIsProfileOpen(false); }}
                          className='w-full text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaHistory className='text-sm' />
                          Conversation History
                        </button>

                        <button
                          onClick={() => { navigate('/premium'); setIsProfileOpen(false); }}
                          className='w-full text-left text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaStar className='text-sm' />
                          Upgrade to Premium
                        </button>

                        <button
                          onClick={() => { navigate('/payment-method'); setIsProfileOpen(false); }}
                          className='w-full text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaCreditCard className='text-sm' />
                          Payment Methods
                        </button>

                        <button
                          onClick={() => { navigate('/analytics'); setIsProfileOpen(false); }}
                          className='w-full text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaChartBar className='text-sm' />
                          Analytics
                        </button>

                        <div className='border-t border-white/10 my-2'></div>

                        <button
                          onClick={() => { navigate('/contact'); setIsProfileOpen(false); }}
                          className='w-full text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3'
                        >
                          <FaEnvelope className='text-sm' />
                          Support
                        </button>

                        <button
                          onClick={() => { handleLogOut(); setIsProfileOpen(false); }}
                          className='w-full text-left text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors duration-300 flex items-center gap-3 px-4 py-3 rounded-b-2xl'
                        >
                          <FaSignOutAlt className='text-sm' />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!userData && (
              <div className='flex items-center space-x-4 ml-4 pl-4 border-l border-white/20'>
                <button
                  onClick={() => navigate('/signin')}
                  className='text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-800/10 transform hover:scale-105'
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className='bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 hover:from-purple-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/30 hover:shadow-purple-600/40'
                >
                  Get Started
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center gap-2'>
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className='text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-300'
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes className='text-xl' /> : <FaBars className='text-xl' />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden bg-gradient-to-b from-black/95 via-purple-900/20 to-black/95 dark:from-black/95 dark:via-purple-900/20 dark:to-black/95 light:from-white/95 light:via-purple-100/20 light:to-white/95 backdrop-blur-xl border-t border-white/20 dark:border-white/20 light:border-gray-300/50'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              <button
                onClick={() => { navigate('/'); closeMenu(); }}
                className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
              >
                <FaHome className='text-lg' />
                Home
              </button>
              <button
                onClick={() => { navigate('/payment-method'); closeMenu(); }}
                className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
              >
                <FaCreditCard className='text-lg' />
                Payment Methods
              </button>

              <button
                onClick={() => { navigate('/legal'); closeMenu(); }}
                className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
              >
                <FaShieldAlt className='text-lg' />
                Legal
              </button>
              <button
                onClick={() => { navigate('/contact'); closeMenu(); }}
                className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
              >
                <FaEnvelope className='text-lg' />
                Contact
              </button>
              <button
                onClick={() => { navigate('/history'); closeMenu(); }}
                className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
              >
                <FaHistory className='text-lg' />
                History
              </button>

              {userData && (
                <>
                  <div className='border-t border-white/10 my-2'></div>
                  {/* Profile Section */}
                  <div className='px-3 py-3 border-b border-white/10'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center'>
                        <FaUserCircle className='text-white' />
                      </div>
                      <div>
                        <p className='text-white font-semibold text-sm'>{userData.name}</p>
                        <p className='text-white/60 text-xs'>{userData.email}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { navigate('/'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    <FaHome className='text-lg' />
                    Dashboard
                  </button>

                  <button
                    onClick={() => { navigate('/customize'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    <FaBrain className='text-lg' />
                    Customize Assistant
                  </button>

                  <button
                    onClick={() => { navigate('/history'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    <FaHistory className='text-lg' />
                    Conversation History
                  </button>

                  <button
                    onClick={() => { navigate('/premium'); closeMenu(); }}
                    className='w-full text-left text-yellow-400 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-yellow-400/10'
                  >
                    <FaStar className='text-lg' />
                    Upgrade to Premium
                  </button>

                  <button
                    onClick={() => { navigate('/payment-method'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    <FaCreditCard className='text-lg' />
                    Payment Methods
                  </button>

                  <button
                    onClick={() => { navigate('/analytics'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    <FaChartBar className='text-lg' />
                    Analytics
                  </button>

                  <div className='border-t border-white/10 my-2'></div>

                  <button
                    onClick={() => { navigate('/contact'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    <FaEnvelope className='text-lg' />
                    Support
                  </button>

                  <button
                    onClick={() => { handleLogOut(); closeMenu(); }}
                    className='w-full text-left text-red-400 hover:text-red-300 transition-colors duration-300 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-400/10'
                  >
                    <FaSignOutAlt className='text-lg' />
                    Sign Out
                  </button>
                </>
              )}

              {!userData && (
                <>
                  <div className='border-t border-white/10 my-2'></div>
                  <button
                    onClick={() => { navigate('/signin'); closeMenu(); }}
                    className='w-full text-left text-white/80 hover:text-white transition-colors duration-300 px-3 py-3 rounded-lg hover:bg-white/10'
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate('/signup'); closeMenu(); }}
                    className='w-full text-left bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-3 py-3 rounded-lg transition-all duration-300'
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header