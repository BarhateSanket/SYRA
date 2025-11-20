import React, { useState } from 'react';
import Camera from './Camera';
import { toast } from 'react-toastify';

const FaceVerification = ({ onSuccess, onCancel, isLogin = false }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = async (embeddings) => {
    setIsVerifying(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/verify-login-face' : '/api/auth/verify-face';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ embeddings })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isLogin ? 'Login successful!' : 'Face verified successfully!');
        onSuccess && onSuccess(data);
      } else {
        setError(data.message || 'Verification failed');
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error occurred');
      toast.error('Network error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="face-verification p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? 'Face Login Verification' : 'Face Verification'}
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        Position your face in the camera and click "Verify Face" to {isLogin ? 'complete login' : 'verify'}.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Camera
        onCapture={handleCapture}
        onError={handleError}
        width={320}
        height={240}
      />

      {isVerifying && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Verifying face...</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          disabled={isVerifying}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FaceVerification;