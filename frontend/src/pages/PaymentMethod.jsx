import React, { useState, useEffect, useContext } from 'react';
import { FaCreditCard, FaPlus, FaTrash, FaEdit, FaCalendarAlt, FaRupeeSign, FaSpinner, FaCheckCircle, FaTimesCircle, FaPauseCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { userDataContext } from '../ContextApi/UserContext';
import Toast from '../components/Toast';

function PaymentMethod() {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(userDataContext);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchSubscriptionData();
    fetchBillingHistory();
  }, []);

  const fetchSubscriptionData = async () => {
  try {
    const response = await fetch(`https://syra-jaeg.onrender.com/api/user/subscription`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: "include"
    });

    const data = await response.json();
    if (data.success) {
      setSubscription(data.data);
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
  }
};


  const fetchBillingHistory = async () => {
    try {
      const response = await fetch(`https://syra-jaeg.onrender.com/api/user/billing-history`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  credentials: "include"
});


      const data = await response.json();
      if (data.success) {
        setBillingHistory(data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching billing history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cancelAtPeriodEnd: true })
      });

      const data = await response.json();
      if (data.success) {
        showToast('Subscription will be cancelled at the end of the billing period', 'warning');
        fetchSubscriptionData(); // Refresh subscription data
      } else {
        showToast(data.message || 'Failed to cancel subscription', 'error');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showToast('Failed to cancel subscription', 'error');
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'trial': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      case 'past_due': return 'text-yellow-400';
      case 'paused': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getSubscriptionStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="text-green-400" />;
      case 'trial': return <FaCalendarAlt className="text-blue-400" />;
      case 'cancelled': return <FaTimesCircle className="text-red-400" />;
      case 'past_due': return <FaPauseCircle className="text-yellow-400" />;
      case 'paused': return <FaPauseCircle className="text-gray-400" />;
      default: return <FaPauseCircle className="text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddPaymentMethod = () => {
    navigate('/add-payment-method');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 light:from-gray-100 light:via-purple-100 light:to-gray-100">
      <Header />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 dark:bg-white/10 light:bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/20 light:border-gray-300/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-800 mb-2">
                  Payment Methods
                </h1>
                <p className="text-white/70 dark:text-white/70 light:text-gray-600">
                  Manage your payment methods for premium subscriptions
                </p>
              </div>
              <button
                onClick={handleAddPaymentMethod}
                className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 hover:from-purple-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/30 hover:shadow-purple-600/40 flex items-center gap-2"
              >
                <FaPlus className="text-sm" />
                Add Payment Method
              </button>
            </div>

            {/* Subscription Status */}
            {subscription && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white dark:text-white light:text-gray-800 mb-4">Current Subscription</h2>
                <div className="bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl p-6 border border-white/10 dark:border-white/10 light:border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getSubscriptionStatusIcon(subscription.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white dark:text-white light:text-gray-800 font-semibold">
                            SYRA Premium {subscription.planType}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getSubscriptionStatusColor(subscription.status)} bg-current/10 border-current/30`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-white/60 dark:text-white/60 light:text-gray-500 text-sm">
                          {subscription.status === 'trial' ? (
                            `Trial ends on ${formatDate(subscription.trialEnd)}`
                          ) : subscription.status === 'active' ? (
                            `Next billing: ${formatDate(subscription.currentPeriodEnd)}`
                          ) : subscription.status === 'cancelled' ? (
                            `Access until ${formatDate(subscription.currentPeriodEnd)}`
                          ) : (
                            `Status: ${subscription.status}`
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-white dark:text-white light:text-gray-800 font-bold">
                          ₹{subscription.planType === 'monthly' ? '999' : '9999'}
                        </div>
                        <div className="text-white/60 dark:text-white/60 light:text-gray-500 text-sm">
                          per {subscription.planType === 'monthly' ? 'month' : 'year'}
                        </div>
                      </div>
                      {(subscription.status === 'active' || subscription.status === 'trial') && (
                        <button
                          onClick={handleCancelSubscription}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-400/10 transition-colors duration-300"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing History */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white dark:text-white light:text-gray-800 mb-4">Billing History</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-purple-400 text-2xl" />
                </div>
              ) : billingHistory.length > 0 ? (
                <div className="space-y-3">
                  {billingHistory.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl p-4 border border-white/10 dark:border-white/10 light:border-gray-200/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaRupeeSign className="text-green-400" />
                          <div>
                            <div className="text-white dark:text-white light:text-gray-800 font-medium">
                              ₹{payment.amount}
                            </div>
                            <div className="text-white/60 dark:text-white/60 light:text-gray-500 text-sm">
                              {formatDate(payment.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            payment.status === 'paid' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                            payment.status === 'failed' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                            'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaRupeeSign className="text-white/30 dark:text-white/30 light:text-gray-400 text-4xl mx-auto mb-3" />
                  <p className="text-white/60 dark:text-white/60 light:text-gray-500">No billing history yet</p>
                </div>
              )}
            </div>

            {/* No Subscription State */}
            {!subscription && !isLoading && (
              <div className="text-center py-12">
                <FaCreditCard className="text-white/30 dark:text-white/30 light:text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-white dark:text-white light:text-gray-800 font-semibold text-xl mb-2">
                  No Active Subscription
                </h3>
                <p className="text-white/60 dark:text-white/60 light:text-gray-500 mb-6">
                  Start your premium journey with a 7-day free trial
                </p>
                <button
                  onClick={handleAddPaymentMethod}
                  className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 hover:from-purple-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/30 hover:shadow-purple-600/40 inline-flex items-center gap-2"
                >
                  <FaPlus className="text-sm" />
                  Start Free Trial
                </button>
              </div>
            )}


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

export default PaymentMethod;
