import React from 'react';
import { FaCreditCard, FaMobileAlt, FaPaypal, FaUniversity, FaGooglePay, FaApplePay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function AddPaymentMethod() {
  const navigate = useNavigate();

  const handlePaymentMethodSelect = (method) => {
    // In a real implementation, this would navigate to the specific payment method setup
    console.log(`Selected payment method: ${method}`);
    // For now, just navigate back to payment methods
    navigate('/payment-method');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 light:from-gray-100 light:via-purple-100 light:to-gray-100">
      <Header />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 dark:bg-white/10 light:bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/20 light:border-gray-300/50 p-8 max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800 mb-6 text-center">
              Add Payment Method
            </h2>

            {/* Payment Method Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handlePaymentMethodSelect('Credit Card')}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
              >
                <FaCreditCard className="text-blue-400 text-2xl" />
                <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">Credit Card</span>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('UPI')}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
              >
                <FaMobileAlt className="text-green-400 text-2xl" />
                <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">UPI</span>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('PayPal')}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
              >
                <FaPaypal className="text-blue-500 text-2xl" />
                <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">PayPal</span>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('Bank Transfer')}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
              >
                <FaUniversity className="text-purple-400 text-2xl" />
                <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">Bank Transfer</span>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('Google Pay')}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
              >
                <FaGooglePay className="text-blue-600 text-2xl" />
                <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">Google Pay</span>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('Apple Pay')}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
              >
                <FaApplePay className="text-gray-800 dark:text-gray-200 text-2xl" />
                <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">Apple Pay</span>
              </button>
            </div>

            <p className="text-white/70 dark:text-white/70 light:text-gray-600 mb-6 text-center">
              Select a payment method to continue. In a real implementation, you would integrate with payment processors like Stripe, PayPal, or local payment gateways.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/payment-method')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-3 rounded-xl transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/payment-method')}
                className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPaymentMethod;
