import React, { useState } from 'react';
import Camera from './Camera';
import { toast } from 'react-toastify';

const FaceEnrollment = ({ onSuccess, onCancel }) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = async (embeddings) => {
    setIsEnrolling(true);
    setError('');

    try {
      const response = await fetch('/api/auth/enroll-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ embeddings })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Face enrolled successfully!');
        onSuccess && onSuccess();
      } else {
        setError(data.message || 'Enrollment failed');
        toast.error(data.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setError('Network error occurred');
      toast.error('Network error occurred');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="face-enrollment p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Face Enrollment</h2>
      <p className="text-gray-600 mb-4 text-center">
        Position your face in the camera and click "Capture Face" to enroll.
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

      {isEnrolling && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Enrolling face...</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          disabled={isEnrolling}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FaceEnrollment;