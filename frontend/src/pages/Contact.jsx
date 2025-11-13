import React, { useState } from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'
import Footer from '../components/Footer'

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual backend integration
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://syra-jaeg.onrender.com'}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative'>
      <Header />

      <div className='flex-1 flex justify-center items-center flex-col p-[20px] sm:p-[40px] pt-24'>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>

        <div className='w-full max-w-7xl relative z-20'>
          {/* Hero Section */}
          <div className='text-center mb-16'>
            <div className='flex justify-center mb-8'>
              <div className='bg-gradient-to-r from-blue-400 via-green-400 to-purple-500 p-6 rounded-2xl shadow-2xl'>
                <FaEnvelope className='text-white text-5xl' />
              </div>
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-6'>
              Contact Us
            </h1>
            <p className='text-white/90 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed'>
              Have questions about SYRA AI? Need support or want to share feedback? We'd love to hear from you.
            </p>
          </div>

          <div className='grid lg:grid-cols-2 gap-12 items-start'>
            {/* Contact Information */}
            <div className='space-y-8'>
              <div>
                <h2 className='text-2xl sm:text-3xl font-bold text-white mb-6'>Get In Touch</h2>
                <p className='text-white/80 text-lg leading-relaxed mb-8'>
                  Our team is here to help you make the most of SYRA AI. Reach out to us through any of the channels below.
                </p>
              </div>

              {/* Contact Cards */}
              <div className='space-y-6'>
                <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-blue-500/20 p-3 rounded-lg'>
                      <FaEnvelope className='text-blue-400 text-xl' />
                    </div>
                    <div>
                      <h3 className='text-white font-semibold text-lg'>Email Support</h3>
                      <p className='text-white/70'>support@syra-ai.com</p>
                      <p className='text-white/60 text-sm'>Response within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-green-500/20 p-3 rounded-lg'>
                      <FaPhone className='text-green-400 text-xl' />
                    </div>
                    <div>
                      <h3 className='text-white font-semibold text-lg'>Phone Support</h3>
                      <p className='text-white/70'>+1 (555) 123-4567</p>
                      <p className='text-white/60 text-sm'>Mon-Fri 9AM-6PM EST</p>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-purple-500/20 p-3 rounded-lg'>
                      <FaMapMarkerAlt className='text-purple-400 text-xl' />
                    </div>
                    <div>
                      <h3 className='text-white font-semibold text-lg'>Office Address</h3>
                      <p className='text-white/70'>123 AI Innovation Drive<br />Tech Valley, CA 94043</p>
                      <p className='text-white/60 text-sm'>United States</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className='bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/20'>
                <h3 className='text-white font-semibold text-lg mb-4'>Why Choose SYRA AI Support?</h3>
                <ul className='text-white/80 space-y-2'>
                  <li className='flex items-center gap-2'>
                    <FaCheckCircle className='text-green-400 text-sm' />
                    <span>Expert AI specialists</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <FaCheckCircle className='text-green-400 text-sm' />
                    <span>24/7 system monitoring</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <FaCheckCircle className='text-green-400 text-sm' />
                    <span>Personalized solutions</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <FaCheckCircle className='text-green-400 text-sm' />
                    <span>Enterprise-grade security</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20'>
              <h2 className='text-2xl sm:text-3xl font-bold text-white mb-6'>Send us a Message</h2>

              {submitStatus === 'success' && (
                <div className='mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3'>
                  <FaCheckCircle className='text-green-400 text-xl' />
                  <div>
                    <p className='text-green-400 font-semibold'>Message Sent Successfully!</p>
                    <p className='text-green-300 text-sm'>We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className='mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3'>
                  <FaExclamationTriangle className='text-red-400 text-xl' />
                  <div>
                    <p className='text-red-400 font-semibold'>Failed to Send Message</p>
                    <p className='text-red-300 text-sm'>Please try again or contact us directly.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label htmlFor='name' className='block text-white font-medium mb-2'>Full Name *</label>
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg bg-white/10 border text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        errors.name
                          ? 'border-red-400 focus:ring-red-400/50'
                          : 'border-white/30 focus:border-blue-400 focus:ring-blue-400/50'
                      }`}
                      placeholder='Your full name'
                    />
                    {errors.name && <p className='text-red-400 text-sm mt-1'>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor='email' className='block text-white font-medium mb-2'>Email Address *</label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg bg-white/10 border text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-400/50'
                          : 'border-white/30 focus:border-blue-400 focus:ring-blue-400/50'
                      }`}
                      placeholder='your.email@example.com'
                    />
                    {errors.email && <p className='text-red-400 text-sm mt-1'>{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor='subject' className='block text-white font-medium mb-2'>Subject *</label>
                  <input
                    type='text'
                    id='subject'
                    name='subject'
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 rounded-lg bg-white/10 border text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.subject
                        ? 'border-red-400 focus:ring-red-400/50'
                        : 'border-white/30 focus:border-blue-400 focus:ring-blue-400/50'
                    }`}
                    placeholder='How can we help you?'
                  />
                  {errors.subject && <p className='text-red-400 text-sm mt-1'>{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor='message' className='block text-white font-medium mb-2'>Message *</label>
                  <textarea
                    id='message'
                    name='message'
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-400/50'
                        : 'border-white/30 focus:border-blue-400 focus:ring-blue-400/50'
                    }`}
                    placeholder='Tell us more about your inquiry...'
                  />
                  {errors.message && <p className='text-red-400 text-sm mt-1'>{errors.message}</p>}
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3'
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact