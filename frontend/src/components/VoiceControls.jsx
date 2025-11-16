import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeDown, FaCog, FaPlay, FaPause } from 'react-icons/fa';
import VoiceVisualization from './VoiceVisualization';

const VoiceControls = ({
  isListening,
  isWakeWordActive,
  voiceSettings,
  onToggleListening,
  onUpdateVoiceSettings,
  onTestVoice,
  onWakeWordToggle
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const controlsRef = useRef(null);

  // Handle volume slider drag
  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onUpdateVoiceSettings({ volume: percentage });
  };

  // Handle rate slider drag
  const handleRateChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0.5, Math.min(2, 0.5 + (x / rect.width) * 1.5));
    onUpdateVoiceSettings({ rate: percentage });
  };

  // Handle pitch slider drag
  const handlePitchChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(2, (x / rect.width) * 2));
    onUpdateVoiceSettings({ pitch: percentage });
  };

  return (
    <div
      ref={controlsRef}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl z-50 p-4"
    >
      {/* Main Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Wake Word Toggle */}
          <button
            onClick={onWakeWordToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isWakeWordActive
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            title={isWakeWordActive ? 'Disable wake word' : 'Enable wake word'}
          >
            <FaMicrophone className={`text-lg ${isWakeWordActive ? 'animate-pulse' : ''}`} />
          </button>

          {/* Main Listen Toggle */}
          <button
            onClick={onToggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
          </button>

          {/* Test Voice Button */}
          <button
            onClick={onTestVoice}
            className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30"
            title="Test voice settings"
          >
            <FaPlay className="text-sm" />
          </button>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            showAdvanced
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          title="Advanced settings"
        >
          <FaCog className={`text-sm transition-transform duration-300 ${showAdvanced ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-xs text-white/70 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isWakeWordActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <span>Wake Word</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-gray-500'}`} />
          <span>Listening</span>
        </div>
      </div>

      {/* Advanced Settings Panel */}
      {showAdvanced && (
        <div className="space-y-4 pt-3 border-t border-white/10">
          {/* Voice Gender Selection */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Voice Gender</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateVoiceSettings({ gender: 'male' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  voiceSettings.gender === 'male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                👨 Male
              </button>
              <button
                onClick={() => onUpdateVoiceSettings({ gender: 'female' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  voiceSettings.gender === 'female'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                👩 Female
              </button>
            </div>
          </div>

          {/* Voice Language */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Language</label>
            <select
              value={voiceSettings.voice}
              onChange={(e) => onUpdateVoiceSettings({ voice: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              <optgroup label="English">
                <option value="en-US-male">🇺🇸 English (US) - Male</option>
                <option value="en-US-female">🇺🇸 English (US) - Female</option>
                <option value="en-GB-male">🇬🇧 English (UK) - Male</option>
                <option value="en-GB-female">🇬🇧 English (UK) - Female</option>
              </optgroup>
              <optgroup label="Hindi">
                <option value="hi-IN-male">🇮🇳 Hindi (India) - Male</option>
                <option value="hi-IN-female">🇮🇳 Hindi (India) - Female</option>
              </optgroup>
            </select>
          </div>

          {/* Volume Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm font-medium">Volume</label>
              <span className="text-purple-400 text-sm">{Math.round(voiceSettings.volume * 100)}%</span>
            </div>
            <div
              className="relative h-6 bg-white/10 rounded-lg cursor-pointer"
              onClick={handleVolumeChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-lg transition-all duration-200"
                style={{ width: `${voiceSettings.volume * 100}%` }}
              />
              <div
                className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${voiceSettings.volume * 100}%` }}
              />
            </div>
          </div>

          {/* Speech Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm font-medium">Speed</label>
              <span className="text-purple-400 text-sm">{voiceSettings.rate.toFixed(1)}x</span>
            </div>
            <div
              className="relative h-6 bg-white/10 rounded-lg cursor-pointer"
              onClick={handleRateChange}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg transition-all duration-200"
                style={{ width: `${((voiceSettings.rate - 0.5) / 1.5) * 100}%` }}
              />
              <div
                className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${((voiceSettings.rate - 0.5) / 1.5) * 100}%` }}
              />
            </div>
          </div>

          {/* Voice Pitch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm font-medium">Pitch</label>
              <span className="text-purple-400 text-sm">{voiceSettings.pitch.toFixed(1)}</span>
            </div>
            <div
              className="relative h-6 bg-white/10 rounded-lg cursor-pointer"
              onClick={handlePitchChange}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg transition-all duration-200"
                style={{ width: `${(voiceSettings.pitch / 2) * 100}%` }}
              />
              <div
                className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${(voiceSettings.pitch / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Touch Instructions */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-white/50 text-center">
          💡 Swipe up to show settings • Double tap to test voice
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;
