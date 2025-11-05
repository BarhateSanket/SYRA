import React from 'react'
import { FaShieldAlt, FaLock, FaUserShield, FaFileContract, FaCookieBite, FaGavel, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Legal() {
  const navigate = useNavigate();

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative'>
      <Header />
      <div className='flex-1 flex justify-center items-center flex-col p-[20px] sm:p-[40px] pt-24'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Premium Header */}
      <div className='absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='bg-gradient-to-r from-blue-400 to-green-500 p-2 rounded-lg shadow-lg'>
              <FaShieldAlt className='text-white text-xl' />
            </div>
            <span className='text-white font-bold text-xl bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent'>Legal & Compliance</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className='flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 border border-white/20 hover:border-white/40 shadow-md hover:shadow-lg'
          >
            <FaArrowLeft />
            <span className='font-medium'>Back to Home</span>
          </button>
        </div>
      </div>

      <div className='w-full max-w-6xl relative z-20 mt-24 sm:mt-32'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <div className='flex justify-center mb-8'>
            <div className='bg-gradient-to-r from-blue-400 via-green-400 to-purple-500 p-6 rounded-2xl shadow-2xl'>
              <FaGavel className='text-white text-5xl' />
            </div>
          </div>
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-6'>
            Legal & Compliance
          </h1>
          <p className='text-white/90 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed'>
            Your trust and privacy are our top priorities. Learn about our commitment to legal compliance, data protection, and ethical AI practices.
          </p>
        </div>

        {/* Legal Sections Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16'>
          {/* Privacy Policy */}
          <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transition-all duration-500 group'>
            <div className='text-blue-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaLock /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Privacy Policy</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed mb-4'>
              We are committed to protecting your personal information and being transparent about our data practices.
            </p>
            <ul className='text-white/70 text-sm space-y-2'>
              <li>• Data collection and usage policies</li>
              <li>• Information security measures</li>
              <li>• User rights and controls</li>
              <li>• Third-party data sharing</li>
            </ul>
          </div>

          {/* Terms of Service */}
          <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-green-400/50 hover:bg-white/15 transition-all duration-500 group'>
            <div className='text-green-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaFileContract /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Terms of Service</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed mb-4'>
              Clear guidelines for using SYRA AI services and understanding your rights and responsibilities.
            </p>
            <ul className='text-white/70 text-sm space-y-2'>
              <li>• Service usage guidelines</li>
              <li>• User responsibilities</li>
              <li>• Service limitations</li>
              <li>• Account termination policies</li>
            </ul>
          </div>

          {/* Data Protection */}
          <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-purple-400/50 hover:bg-white/15 transition-all duration-500 group'>
            <div className='text-purple-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaUserShield /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Data Protection</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed mb-4'>
              Comprehensive measures to ensure your data is secure, private, and handled responsibly.
            </p>
            <ul className='text-white/70 text-sm space-y-2'>
              <li>• GDPR compliance</li>
              <li>• Encryption standards</li>
              <li>• Data retention policies</li>
              <li>• Security certifications</li>
            </ul>
          </div>

          {/* Cookie Policy */}
          <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-orange-400/50 hover:bg-white/15 transition-all duration-500 group'>
            <div className='text-orange-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaCookieBite /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Cookie Policy</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed mb-4'>
              Information about how we use cookies and similar technologies to enhance your experience.
            </p>
            <ul className='text-white/70 text-sm space-y-2'>
              <li>• Essential cookies</li>
              <li>• Analytics and performance</li>
              <li>• Functional cookies</li>
              <li>• Cookie preferences</li>
            </ul>
          </div>

          {/* AI Ethics */}
          <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-pink-400/50 hover:bg-white/15 transition-all duration-500 group'>
            <div className='text-pink-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaShieldAlt /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>AI Ethics</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed mb-4'>
              Our commitment to responsible AI development and ethical use of artificial intelligence.
            </p>
            <ul className='text-white/70 text-sm space-y-2'>
              <li>• Bias mitigation</li>
              <li>• Transparency in AI decisions</li>
              <li>• Human oversight</li>
              <li>• Ethical guidelines</li>
            </ul>
          </div>

          {/* Compliance */}
          <div className='bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-yellow-400/50 hover:bg-white/15 transition-all duration-500 group'>
            <div className='text-yellow-400 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300'><FaGavel /></div>
            <h3 className='text-white font-bold text-xl sm:text-2xl mb-3'>Compliance</h3>
            <p className='text-white/80 text-sm sm:text-base leading-relaxed mb-4'>
              Adherence to international standards and regulations for data protection and privacy.
            </p>
            <ul className='text-white/70 text-sm space-y-2'>
              <li>• ISO 27001 certified</li>
              <li>• SOC 2 Type II compliant</li>
              <li>• Regular audits</li>
              <li>• Industry standards</li>
            </ul>
          </div>
        </div>

        {/* Key Commitments */}
        <div className='bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 rounded-3xl p-8 sm:p-12 border border-blue-400/20 mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold text-white mb-8 text-center'>Our Key Commitments</h2>
          <div className='grid md:grid-cols-2 gap-8'>
            <div>
              <h3 className='text-xl font-semibold text-blue-400 mb-4'>Data Security</h3>
              <ul className='text-white/80 space-y-2'>
                <li>• End-to-end encryption for all data transmission</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• Multi-factor authentication for all accounts</li>
                <li>• Secure data centers with 99.9% uptime SLA</li>
                <li>• Automatic data backup and disaster recovery</li>
              </ul>
            </div>
            <div>
              <h3 className='text-xl font-semibold text-green-400 mb-4'>Privacy Rights</h3>
              <ul className='text-white/80 space-y-2'>
                <li>• Right to access your personal data</li>
                <li>• Right to data portability</li>
                <li>• Right to data deletion ("right to be forgotten")</li>
                <li>• Right to object to data processing</li>
                <li>• Transparent data processing notifications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className='text-center'>
          <h2 className='text-2xl sm:text-3xl font-bold text-white mb-4'>Questions About Our Policies?</h2>
          <p className='text-white/70 text-lg mb-8 max-w-2xl mx-auto'>
            Our legal and compliance team is here to help. Contact us for any questions about our policies or practices.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              className='bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label="Contact our legal team for questions about policies"
              role="button"
              tabIndex={0}
            >
              Contact Legal Team
            </button>
            <button
              onClick={() => window.open('/policies.pdf', '_blank')}
              className='bg-transparent border-2 border-white/30 hover:border-white/60 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:bg-white/10'
            >
              Download Policies
            </button>
          </div>
        </div>
      </div>
      </div>


    </div>
  )
}

export default Legal