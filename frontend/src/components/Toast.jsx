import React, { useEffect } from 'react'
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa'

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [onClose, duration])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-400/50',
          icon: <FaCheck className='text-green-400' />,
          text: 'text-green-400'
        }
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-400/50',
          icon: <FaExclamationTriangle className='text-red-400' />,
          text: 'text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/50',
          icon: <FaExclamationTriangle className='text-yellow-400' />,
          text: 'text-yellow-400'
        }
      case 'info':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/50',
          icon: <FaInfo className='text-blue-400' />,
          text: 'text-blue-400'
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/50',
          icon: <FaInfo className='text-gray-400' />,
          text: 'text-gray-400'
        }
    }
  }

  const styles = getToastStyles()

  return (
    <div className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md ${styles.bg} backdrop-blur-lg border ${styles.border} rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-full duration-300`}>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0 mt-0.5'>
          {styles.icon}
        </div>
        <div className='flex-1'>
          <p className={`text-sm font-medium ${styles.text}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.text}`}
        >
          <FaTimes className='w-3 h-3' />
        </button>
      </div>
    </div>
  )
}

export default Toast