import React from 'react'

function ProgressBar({ progress = 0, className = '', showPercentage = true, color = 'blue' }) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500/20',
          fill: 'bg-gradient-to-r from-blue-400 to-blue-600',
          text: 'text-blue-400'
        }
      case 'green':
        return {
          bg: 'bg-green-500/20',
          fill: 'bg-gradient-to-r from-green-400 to-green-600',
          text: 'text-green-400'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-500/20',
          fill: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
          text: 'text-yellow-400'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500/20',
          fill: 'bg-gradient-to-r from-purple-400 to-purple-600',
          text: 'text-purple-400'
        }
      default:
        return {
          bg: 'bg-blue-500/20',
          fill: 'bg-gradient-to-r from-blue-400 to-blue-600',
          text: 'text-blue-400'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full h-3 ${colors.bg} backdrop-blur-lg rounded-full overflow-hidden border border-white/10`}>
        <div
          className={`h-full ${colors.fill} rounded-full transition-all duration-500 ease-out relative`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </div>
      {showPercentage && (
        <div className={`text-right mt-2 text-sm font-medium ${colors.text}`}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}

export default ProgressBar