import React, { useEffect, useRef, useState } from 'react';

const VoiceVisualization = ({ isActive = false, className = '' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [audioData, setAudioData] = useState(new Uint8Array(128));

  useEffect(() => {
    if (!isActive) {
      // Reset to flat line when not active
      setAudioData(new Uint8Array(128));
      return;
    }

    let audioContext;
    let analyser;
    let microphone;
    let dataArray;

    const initializeAudio = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVisualization = () => {
          if (analyser && isActive) {
            analyser.getByteFrequencyData(dataArray);
            setAudioData(new Uint8Array(dataArray));
            animationRef.current = requestAnimationFrame(updateVisualization);
          }
        };

        updateVisualization();
      } catch (error) {
        console.error('Error initializing voice visualization:', error);
      }
    };

    initializeAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (microphone) {
        microphone.disconnect();
      }
    };
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!isActive) {
      // Draw flat line when not active
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'; // gray-400 with opacity
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // Draw waveform
    ctx.strokeStyle = isActive ? '#3b82f6' : 'rgba(156, 163, 175, 0.3)'; // blue-500 or gray-400
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / audioData.length;
    let x = 0;

    for (let i = 0; i < audioData.length; i++) {
      const v = audioData[i] / 128.0; // Normalize to 0-1
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, height / 2 - y);
      } else {
        ctx.lineTo(x, height / 2 - y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Add glow effect when active
    if (isActive) {
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [audioData, isActive]);

  return (
    <div className={`voice-visualization ${className}`}>
      <canvas
        ref={canvasRef}
        width={200}
        height={60}
        className="w-full h-full"
        aria-label={isActive ? "Voice waveform visualization" : "Voice visualization inactive"}
      />
      {isActive && (
        <div className="flex justify-center mt-1">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceVisualization;
