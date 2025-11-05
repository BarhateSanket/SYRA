import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaTimes, FaHistory, FaExternalLinkAlt } from 'react-icons/fa'

function SearchBar({ isOpen, onClose, onSearch }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('syraRecentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const commonCommands = [
        'open youtube',
        'open google',
        'open gmail',
        'open calculator',
        'show weather',
        'open instagram',
        'open facebook',
        'open twitter',
        'open linkedin',
        'open github',
        'open whatsapp',
        'open spotify',
        'open netflix',
        'open maps',
        'open drive',
        'open calendar',
        'open photos',
        'open docs',
        'open sheets',
        'open slides',
        'open classroom',
        'open meet',
        'open translate',
        'open news'
      ]

      const filtered = commonCommands.filter(cmd =>
        cmd.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)

      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [query])

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem('syraRecentSearches', JSON.stringify(updated))

      // Perform search
      onSearch(searchQuery)
      setQuery('')
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter(s => s !== searchToRemove)
    setRecentSearches(updated)
    localStorage.setItem('syraRecentSearches', JSON.stringify(updated))
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4'>
      <div
        ref={searchRef}
        className='w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden'
      >
        {/* Search Input */}
        <div className='p-6 border-b border-white/10'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg' />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search commands, apps, or ask anything..."
              className='w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-lg'
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white'
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className='max-h-96 overflow-y-auto'>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className='p-4'>
              <h3 className='text-white/80 text-sm font-semibold mb-3'>Suggestions</h3>
              <div className='space-y-2'>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className='w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center gap-3 group'
                  >
                    <FaSearch className='text-purple-400 text-sm' />
                    <span className='text-white group-hover:text-purple-300'>{suggestion}</span>
                    <FaExternalLinkAlt className='text-white/40 text-xs ml-auto group-hover:text-purple-400' />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && query.length === 0 && (
            <div className='p-4'>
              <h3 className='text-white/80 text-sm font-semibold mb-3'>Recent Searches</h3>
              <div className='space-y-2'>
                {recentSearches.map((search, index) => (
                  <div key={index} className='flex items-center gap-3 group'>
                    <button
                      onClick={() => handleSearch(search)}
                      className='flex-1 text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center gap-3'
                    >
                      <FaHistory className='text-blue-400 text-sm' />
                      <span className='text-white group-hover:text-blue-300'>{search}</span>
                    </button>
                    <button
                      onClick={() => removeRecentSearch(search)}
                      className='p-2 text-white/40 hover:text-red-400 transition-colors'
                    >
                      <FaTimes className='text-xs' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {query.length === 0 && (
            <div className='p-4 border-t border-white/10'>
              <h3 className='text-white/80 text-sm font-semibold mb-3'>Quick Actions</h3>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  { text: 'Open YouTube', icon: '📺' },
                  { text: 'Check Weather', icon: '🌤️' },
                  { text: 'Open Calculator', icon: '🧮' },
                  { text: 'Open Gmail', icon: '📧' }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(action.text)}
                    className='p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-white/10 hover:border-purple-400/50 transition-all duration-200 flex items-center gap-3 group'
                  >
                    <span className='text-lg'>{action.icon}</span>
                    <span className='text-white text-sm group-hover:text-purple-300'>{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-white/10 bg-black/20'>
          <div className='flex items-center justify-between text-xs text-white/60'>
            <span>Press Enter to search • Esc to close</span>
            <span>Powered by SYRA AI</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchBar