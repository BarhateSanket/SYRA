import React, { useState, useContext } from 'react';
import { FaCreditCard, FaMobileAlt, FaPaypal, FaUniversity, FaGooglePay, FaApplePay, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { UserDataContext } from '../ContextApi/UserContext.jsx';
import Toast from '../components/Toast';

function AddPaymentMethod() {
  const navigate = useNavigate();
  const { userData } = useContext(userDataContext);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscriptionCreate = async (planType) => {
    try {
      setIsProcessing(true);

      const response = await fetch("https://syra-jaeg.onrender.com/api/user/subscription", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  body: JSON.stringify({ planType }),
  credentials: "include"
});



      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      return data.data;
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodSelect = async (method) => {
    if (method !== 'razorpay') {
      showToast('Only Razorpay payments are currently supported', 'warning');
      return;
    }

    try {
      setIsProcessing(true);

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create subscription
      const subscriptionData = await handleSubscriptionCreate(selectedPlan);

      // Initialize Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscriptionData.razorpaySubscriptionId,
        name: 'SYRA AI Premium',
        description: `SYRA Premium ${selectedPlan} subscription`,
        image: '/logo1.png',
        handler: function (response) {
          console.log('Payment successful:', response);
          showToast('Subscription activated successfully!', 'success');
          setTimeout(() => navigate('/payment-method'), 2000);
        },
        prefill: {
          name: userData?.name || '',
          email: userData?.email || '',
        },
        notes: {
          userId: userData?._id,
          planType: selectedPlan
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: function() {
            showToast('Payment cancelled', 'warning');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      showToast(error.message || 'Failed to initialize payment', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 light:from-gray-100 light:via-purple-100 light:to-gray-100">
      <Header />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 dark:bg-white/10 light:bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/20 light:border-gray-300/50 p-8 max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800 mb-6 text-center">
              Start Your Premium Journey
            </h2>

            {/* Plan Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800 mb-3 text-center">Choose Your Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    selectedPlan === 'monthly'
                      ? 'border-purple-400 bg-purple-400/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">Monthly</div>
                  <div className="text-lg font-bold">₹999</div>
                  <div className="text-xs opacity-75">per month</div>
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    selectedPlan === 'yearly'
                      ? 'border-purple-400 bg-purple-400/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">Yearly</div>
                  <div className="text-lg font-bold">₹9999</div>
                  <div className="text-xs opacity-75">per year</div>
                  <div className="text-xs text-green-400 font-medium">Save 17%</div>
                </button>
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800 mb-3 text-center">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePaymentMethodSelect('razorpay')}
                  className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
                >
                  <FaMobileAlt className="text-green-400 text-2xl" />
                  <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">UPI/GPay/PhonePe</span>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('razorpay')}
                  className="flex flex-col items-center gap-3 p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
                >
                  <FaCreditCard className="text-blue-400 text-2xl" />
                  <span className="text-white dark:text-white light:text-gray-800 font-medium text-sm">Card/Net Banking</span>
                </button>
              </div>
            </div>

            <p className="text-white/70 dark:text-white/70 light:text-gray-600 mb-6 text-center">
              Start your 7-day free trial today. No charges until trial ends. Cancel anytime.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/payment-method')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-3 rounded-xl transition-colors duration-300"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={() => handlePaymentMethodSelect('razorpay')}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
}

export default AddPaymentMethod;
