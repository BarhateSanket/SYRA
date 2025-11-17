import React, { useState, useEffect, useContext } from 'react';
import { FaCreditCard, FaPlus, FaTrash, FaEdit, FaCalendarAlt, FaRupeeSign, FaSpinner, FaCheckCircle, FaTimesCircle, FaPauseCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { UserDataContext } from '../ContextApi/UserContext.jsx';
import Toast from '../components/Toast';

function PaymentMethod() {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserDataContext);
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

  // ✅ FIXED — Removed Authorization header, cookie only
  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch(`https://syra-jaeg.onrender.com/api/user/subscription`, {
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

  // ✅ FIXED — cookies included only
  const fetchBillingHistory = async () => {
    try {
      const response = await fetch(`https://syra-jaeg.onrender.com/api/user/billing-history`, {
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

  // ❌ OLD — sending Authorization header (wrong)
  // ❌ OLD — missing credentials (cookie not sent)

  // ✅ NEW — correct authentication (cookie only)
  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      const response = await fetch(`https://syra-jaeg.onrender.com/api/user/subscription/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // 🔥 REQUIRED for cookie-based auth
        body: JSON.stringify({ cancelAtPeriodEnd: true })
      });

      const data = await response.json();

      if (data.success) {
        showToast("Subscription will be cancelled at the end of the billing period", "warning");
        fetchSubscriptionData();
      } else {
        showToast(data.message || "Failed to cancel subscription", "error");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      showToast("Failed to cancel subscription", "error");
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

            {/* Subscription */}
            {subscription && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getSubscriptionStatusIcon(subscription.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            SYRA Premium {subscription.planType}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getSubscriptionStatusColor(subscription.status)} bg-current/10 border-current/30`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-white/60 text-sm">
                          {subscription.status === "trial" ? (
                            `Trial ends on ${formatDate(subscription.trialEnd)}`
                          ) : subscription.status === "active" ? (
                            `Next billing: ${formatDate(subscription.currentPeriodEnd)}`
                          ) : subscription.status === "cancelled" ? (
                            `Access until ${formatDate(subscription.currentPeriodEnd)}`
                          ) : (
                            `Status: ${subscription.status}`
                          )}
                        </p>
                      </div>
                    </div>

                    {(subscription.status === "active" || subscription.status === "trial") && (
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
            )}

            {/* Billing History */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Billing History</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-purple-400 text-2xl" />
                </div>
              ) : billingHistory.length > 0 ? (
                <div className="space-y-3">
                  {billingHistory.map((payment) => (
                    <div key={payment._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaRupeeSign className="text-green-400" />
                          <div>
                            <div className="text-white font-medium">₹{payment.amount}</div>
                            <div className="text-white/60 text-sm">{formatDate(payment.createdAt)}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            payment.status === "paid"
                              ? "text-green-400 bg-green-400/10 border-green-400/30"
                              : payment.status === "failed"
                              ? "text-red-400 bg-red-400/10 border-red-400/30"
                              : "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
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
                  <FaRupeeSign className="text-white/30 text-4xl mx-auto mb-3" />
                  <p className="text-white/60">No billing history yet</p>
                </div>
              )}
            </div>

            {/* No Subscription */}
            {!subscription && !isLoading && (
              <div className="text-center py-12">
                <FaCreditCard className="text-white/30 text-6xl mx-auto mb-4" />
                <h3 className="text-white font-semibold text-xl mb-2">
                  No Active Subscription
                </h3>
                <p className="text-white/60 mb-6">
                  Start your premium journey with a 7-day free trial
                </p>

                <button
                  onClick={handleAddPaymentMethod}
                  className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl"
                >
                  <FaPlus className="text-sm" />
                  Start Free Trial
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

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
