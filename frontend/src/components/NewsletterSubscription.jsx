import React, { useState } from 'react'
import { FaPaperPlane, FaCheck, FaEnvelope } from 'react-icons/fa'

function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate API call - replace with actual newsletter subscription endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Here you would typically make an API call to your backend
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })

      setIsSubscribed(true)
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false)
      }, 5000)

    } catch (error) {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10'>
      <div className='text-center'>
        <div className='flex items-center justify-center gap-3 mb-3'>
          <FaEnvelope className='text-purple-400 text-xl' />
          <h3 className='text-white font-bold text-xl'>Stay Updated</h3>
        </div>
        <p className='text-white/70 text-sm mb-4'>
          Get the latest updates on SYRA AI features, improvements, and exclusive content
        </p>

        {isSubscribed ? (
          <div className='flex items-center justify-center gap-3 text-green-400 bg-green-400/10 rounded-lg p-4'>
            <FaCheck className='text-xl' />
            <span className='font-semibold'>Successfully subscribed!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className='max-w-md mx-auto'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='flex-1 relative'>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
                  disabled={isLoading}
                />
                <FaEnvelope className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40' />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className='px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 min-w-[120px]'
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                ) : (
                  <>
                    <FaPaperPlane className='text-sm' />
                    Subscribe
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className='mt-3 text-red-400 text-sm bg-red-400/10 rounded-lg p-2'>
                {error}
              </div>
            )}

            <p className='text-white/50 text-xs mt-3'>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default NewsletterSubscription