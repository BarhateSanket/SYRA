import React from 'react'

function SkeletonLoader({ className = '', variant = 'card' }) {
  const getSkeletonContent = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse ${className}`}>
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-12 h-12 bg-white/10 rounded-xl animate-pulse'></div>
              <div className='flex-1'>
                <div className='h-4 bg-white/10 rounded mb-2 animate-pulse'></div>
                <div className='h-3 bg-white/5 rounded w-3/4 animate-pulse'></div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='h-3 bg-white/5 rounded animate-pulse'></div>
              <div className='h-3 bg-white/5 rounded w-5/6 animate-pulse'></div>
              <div className='h-3 bg-white/5 rounded w-4/6 animate-pulse'></div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div className={`space-y-2 animate-pulse ${className}`}>
            <div className='h-4 bg-white/10 rounded animate-pulse'></div>
            <div className='h-4 bg-white/5 rounded w-5/6 animate-pulse'></div>
            <div className='h-4 bg-white/5 rounded w-4/6 animate-pulse'></div>
          </div>
        )
      case 'avatar':
        return (
          <div className={`w-16 h-16 bg-white/10 rounded-full animate-pulse ${className}`}></div>
        )
      case 'button':
        return (
          <div className={`h-12 bg-white/10 rounded-full animate-pulse ${className}`}></div>
        )
      case 'assistant':
        return (
          <div className={`flex flex-col items-center gap-6 animate-pulse ${className}`}>
            <div className='w-[280px] sm:w-[320px] h-[260px] sm:h-[300px] bg-white/10 rounded-3xl animate-pulse'></div>
            <div className='h-8 bg-white/10 rounded w-48 animate-pulse'></div>
            <div className='flex gap-4'>
              <div className='w-[150px] sm:w-[180px] h-[150px] sm:h-[180px] bg-white/10 rounded-full animate-pulse'></div>
              <div className='w-[150px] sm:w-[180px] h-[150px] sm:h-[180px] bg-white/10 rounded-full animate-pulse'></div>
            </div>
            <div className='h-6 bg-white/10 rounded w-64 animate-pulse'></div>
            <div className='h-4 bg-white/10 rounded w-32 animate-pulse'></div>
          </div>
        )
      case 'feature-grid':
        return (
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl px-4 animate-pulse ${className}`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10'>
                <div className='w-6 h-6 bg-white/10 rounded mb-2 animate-pulse'></div>
                <div className='h-4 bg-white/10 rounded mb-1 animate-pulse'></div>
                <div className='h-3 bg-white/5 rounded w-3/4 animate-pulse'></div>
              </div>
            ))}
          </div>
        )
      case 'history':
        return (
          <div className={`space-y-3 animate-pulse ${className}`}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10'>
                <div className='h-4 bg-white/10 rounded animate-pulse'></div>
              </div>
            ))}
          </div>
        )
      case 'form':
        return (
          <div className={`space-y-4 animate-pulse ${className}`}>
            <div className='h-12 bg-white/10 rounded-lg animate-pulse'></div>
            <div className='h-12 bg-white/10 rounded-lg animate-pulse'></div>
            <div className='h-12 bg-white/5 rounded-lg animate-pulse'></div>
          </div>
        )
      default:
        return (
          <div className={`bg-white/5 rounded-lg animate-pulse ${className}`}>
            <div className='h-32 bg-white/10 rounded-t-lg animate-pulse'></div>
            <div className='p-4 space-y-2'>
              <div className='h-4 bg-white/10 rounded animate-pulse'></div>
              <div className='h-3 bg-white/5 rounded w-3/4 animate-pulse'></div>
            </div>
          </div>
        )
    }
  }

  return getSkeletonContent()
}

export default SkeletonLoader