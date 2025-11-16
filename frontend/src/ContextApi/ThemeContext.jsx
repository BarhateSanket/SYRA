import React, { createContext, useContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('syra-theme')
    if (saved) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Conversation themes for chat interface
  const [conversationTheme, setConversationTheme] = useState(() => {
    return localStorage.getItem('syra-conversation-theme') || 'default'
  })

  // Available conversation themes
  const conversationThemes = {
    default: {
      name: 'Default',
      userBubble: 'bg-blue-500 text-white',
      assistantBubble: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white',
      background: 'bg-white dark:bg-gray-900'
    },
    ocean: {
      name: 'Ocean',
      userBubble: 'bg-cyan-500 text-white',
      assistantBubble: 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100',
      background: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'
    },
    sunset: {
      name: 'Sunset',
      userBubble: 'bg-orange-500 text-white',
      assistantBubble: 'bg-orange-50 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100',
      background: 'bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950'
    },
    forest: {
      name: 'Forest',
      userBubble: 'bg-green-500 text-white',
      assistantBubble: 'bg-green-50 dark:bg-green-900/50 text-green-900 dark:text-green-100',
      background: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'
    },
    purple: {
      name: 'Purple',
      userBubble: 'bg-purple-500 text-white',
      assistantBubble: 'bg-purple-50 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100',
      background: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950'
    }
  }

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('syra-theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('syra-theme', 'light')
    }
  }, [isDarkMode])

  useEffect(() => {
    // Save conversation theme preference
    localStorage.setItem('syra-conversation-theme', conversationTheme)
  }, [conversationTheme])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const changeConversationTheme = (theme) => {
    if (conversationThemes[theme]) {
      setConversationTheme(theme)
    }
  }

  const getCurrentConversationTheme = () => {
    return conversationThemes[conversationTheme] || conversationThemes.default
  }

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      conversationTheme,
      conversationThemes,
      changeConversationTheme,
      getCurrentConversationTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
