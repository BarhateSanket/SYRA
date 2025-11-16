import { useState, useEffect, useRef, useCallback } from 'react';

const useWakeWord = (wakeWords = ['hey syra', 'hi syra', 'okay syra'], onWakeWordDetected = () => {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [sensitivity, setSensitivity] = useState(0.7); // 0-1, higher = more sensitive

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Initialize audio context and microphone
  const initializeAudio = useCallback(async () => {
    try {
      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Web Audio API not supported');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      // Configure analyser
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser
      microphoneRef.current.connect(analyserRef.current);

      setIsSupported(true);
      setError(null);

    } catch (err) {
      console.error('Error initializing wake word detection:', err);
      setError(err.message);
      setIsSupported(false);
    }
  }, []);

  // Simple keyword spotting using frequency analysis
  const detectWakeWord = useCallback((audioData) => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;

    try {
      // Convert audio data to frequency domain
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Simple energy-based detection (can be improved with ML models)
      const energy = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

      // Check for speech-like patterns (basic heuristic)
      const hasSpeech = energy > (sensitivity * 50); // Adjust threshold based on sensitivity

      if (hasSpeech) {
        // Additional check: look for patterns that might indicate wake words
        // This is a simplified version - in production, you'd use proper speech recognition
        const dominantFrequencies = [];
        for (let i = 0; i < Math.min(10, dataArray.length); i++) {
          if (dataArray[i] > 100) { // Threshold for significant frequency
            dominantFrequencies.push(i);
          }
        }

        // If we detect speech-like audio, trigger wake word detection
        if (dominantFrequencies.length > 2) {
          console.log('Wake word pattern detected');
          onWakeWordDetected();
        }
      }

    } catch (err) {
      console.error('Error in wake word detection:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [sensitivity, onWakeWordDetected]);

  // Audio processing loop
  const processAudio = useCallback(() => {
    if (!analyserRef.current || !isListening) return;

    detectWakeWord();
    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [isListening, detectWakeWord]);

  // Start wake word detection
  const startListening = useCallback(async () => {
    if (!isSupported) {
      await initializeAudio();
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsListening(true);
    processAudio();
  }, [isSupported, initializeAudio, processAudio]);

  // Stop wake word detection
  const stopListening = useCallback(() => {
    setIsListening(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Update sensitivity
  const updateSensitivity = useCallback((newSensitivity) => {
    setSensitivity(Math.max(0, Math.min(1, newSensitivity)));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
    };
  }, [stopListening]);

  // Auto-start if supported
  useEffect(() => {
    if (isSupported && !isListening) {
      // Small delay to ensure proper initialization
      const timer = setTimeout(() => {
        startListening();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, isListening, startListening]);

  return {
    isListening,
    isSupported,
    error,
    sensitivity,
    startListening,
    stopListening,
    updateSensitivity
  };
};

export default useWakeWord;
