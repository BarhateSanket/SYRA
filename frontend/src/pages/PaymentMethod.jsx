import React, { useState } from 'react';
import { FaCreditCard, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function PaymentMethod() {
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'Credit Card',
      last4: '1234',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'Credit Card',
      last4: '5678',
      brand: 'Mastercard',
      expiry: '08/26',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAddPaymentMethod = () => {
    navigate('/add-payment-method');
  };

  const handleEditPaymentMethod = (id) => {
    setEditingId(id);
    setShowAddForm(true);
  };

  const handleDeletePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
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

            {/* Payment Methods List */}
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-white/5 dark:bg-white/5 light:bg-gray-50/80 rounded-xl p-6 border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/80 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-xl">
                        <FaCreditCard className="text-white text-xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white dark:text-white light:text-gray-800 font-semibold">
                            {method.brand} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-400/30">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 dark:text-white/60 light:text-gray-500 text-sm">
                          Expires {method.expiry}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-purple-400 hover:text-purple-300 text-sm px-3 py-1 rounded-lg hover:bg-purple-400/10 transition-colors duration-300"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEditPaymentMethod(method.id)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-400/10 transition-colors duration-300"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors duration-300"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <div className="text-center py-12">
                <FaCreditCard className="text-white/30 dark:text-white/30 light:text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-white dark:text-white light:text-gray-800 font-semibold text-xl mb-2">
                  No Payment Methods
                </h3>
                <p className="text-white/60 dark:text-white/60 light:text-gray-500 mb-6">
                  Add a payment method to subscribe to premium features
                </p>
                <button
                  onClick={handleAddPaymentMethod}
                  className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 hover:from-purple-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/30 hover:shadow-purple-600/40 inline-flex items-center gap-2"
                >
                  <FaPlus className="text-sm" />
                  Add Your First Payment Method
                </button>
              </div>
            )}


          </div>
        </div>
      </div>

    </div>
  );
}

export default PaymentMethod;
