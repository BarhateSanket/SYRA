import React from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '../ContextApi/ThemeContext'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/10 dark:bg-white/10 light:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-gray-800/20 transition-all duration-300 transform hover:scale-110 border border-white/20 dark:border-white/20 light:border-gray-800/20"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <FaSun className="text-yellow-400 text-lg" />
      ) : (
        <FaMoon className="text-blue-400 dark:text-blue-400 light:text-blue-600 text-lg" />
      )}
    </button>
  )
}

export default ThemeToggle