import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const Camera = ({ onCapture, onError, width = 640, height = 480 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Starting to load face-api models from /models');
        console.log('Loading tinyFaceDetector...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        console.log('tinyFaceDetector loaded successfully');

        console.log('Loading faceLandmark68Net...');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log('faceLandmark68Net loaded successfully');

        console.log('Loading faceRecognitionNet...');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        console.log('faceRecognitionNet loaded successfully');

        setModelsLoaded(true);
        console.log('All models loaded successfully');
      } catch (error) {
        console.error('Error loading face-api models:', error);
        console.error('Error details:', error.message, error.stack);
        onError && onError('Failed to load face recognition models');
      }
    };

    loadModels();
  }, [onError]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width, height, facingMode: 'user' }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing camera:', error);
        onError && onError('Camera access denied or not available');
        setIsLoading(false);
      }
    };

    if (modelsLoaded && !stream) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded, stream, width, height, onError]);

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3, inputSize: 512 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      console.log('Detection result:', detection);

      if (detection) {
        return detection.descriptor; // This is the embedding array
      } else {
        onError && onError('No face detected. Please ensure your face is clearly visible and well-lit.');
        return null;
      }
    } catch (error) {
      console.error('Face detection error:', error);
      onError && onError('Face detection failed: ' + error.message);
      return null;
    }
  };

  const handleCapture = async () => {
    const embeddings = await captureFace();
    if (embeddings && onCapture) {
      onCapture(embeddings);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="border rounded-lg"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="mt-4 text-center">
        <button
          onClick={handleCapture}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={!modelsLoaded}
        >
          Capture Face
        </button>
      </div>
    </div>
  );
};

export default Camera;