import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useWakeWord from '../hooks/useWakeWord'

// Mock the Web Audio API
const mockAudioContext = {
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
  })),
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  close: vi.fn(),
  resume: vi.fn(),
  state: 'running',
}

const mockGetUserMedia = vi.fn()
const mockMediaDevices = {
  getUserMedia: mockGetUserMedia,
}

Object.defineProperty(navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
})

Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
})

Object.defineProperty(window, 'webkitAudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
})

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))

describe('useWakeWord Hook', () => {
  let mockOnWakeWordDetected

  beforeEach(() => {
    mockOnWakeWordDetected = vi.fn()
    vi.clearAllMocks()

    // Reset mocks
    mockGetUserMedia.mockResolvedValue({
      getTracks: vi.fn(() => []),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('returns correct initial state', () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      expect(result.current.isListening).toBe(false)
      expect(result.current.isSupported).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.sensitivity).toBe(0.7)
    })

    it('initializes with custom wake words', () => {
      const customWakeWords = ['hello', 'hi there']
      const { result } = renderHook(() => useWakeWord(customWakeWords, mockOnWakeWordDetected))

      expect(result.current.isListening).toBe(false)
    })

    it('sets error when Web Audio API is not supported', () => {
      // Mock unsupported environment
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        writable: true,
      })

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      expect(result.current.isSupported).toBe(false)
      expect(result.current.error).toBe('Web Audio API not supported')
    })
  })

  describe('Audio Initialization', () => {
    it('successfully initializes audio context and microphone', async () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      })
      expect(result.current.isSupported).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('handles microphone permission denial', async () => {
      const permissionError = new Error('Permission denied')
      mockGetUserMedia.mockRejectedValue(permissionError)

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      expect(result.current.isSupported).toBe(false)
      expect(result.current.error).toBe('Permission denied')
    })

    it('resumes suspended audio context', async () => {
      const suspendedContext = { ...mockAudioContext, state: 'suspended' }
      window.AudioContext.mockReturnValueOnce(suspendedContext)

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      expect(suspendedContext.resume).toHaveBeenCalled()
    })
  })

  describe('Wake Word Detection', () => {
    it('starts listening when startListening is called', async () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      expect(result.current.isListening).toBe(true)
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('stops listening when stopListening is called', async () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
        result.current.stopListening()
      })

      expect(result.current.isListening).toBe(false)
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })

    it('detects wake word pattern and calls callback', async () => {
      const mockAnalyser = {
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn((array) => {
          // Simulate audio data with significant frequencies
          for (let i = 0; i < array.length; i++) {
            array[i] = i < 3 ? 150 : 50 // First 3 frequencies are above threshold
          }
        }),
        connect: vi.fn(),
      }

      mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser)

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      // Wait for a few animation frames to process
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(mockOnWakeWordDetected).toHaveBeenCalled()
    })

    it('does not detect wake word with low frequency data', async () => {
      const mockAnalyser = {
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn((array) => {
          // Simulate low audio data
          for (let i = 0; i < array.length; i++) {
            array[i] = 50 // Below threshold
          }
        }),
        connect: vi.fn(),
      }

      mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser)

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      // Wait for processing
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(mockOnWakeWordDetected).not.toHaveBeenCalled()
    })
  })

  describe('Sensitivity Control', () => {
    it('updates sensitivity correctly', () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      act(() => {
        result.current.updateSensitivity(0.8)
      })

      expect(result.current.sensitivity).toBe(0.8)
    })

    it('clamps sensitivity to valid range', () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      act(() => {
        result.current.updateSensitivity(1.5) // Above max
      })
      expect(result.current.sensitivity).toBe(1)

      act(() => {
        result.current.updateSensitivity(-0.5) // Below min
      })
      expect(result.current.sensitivity).toBe(0)
    })
  })

  describe('Cleanup', () => {
    it('cleans up resources on unmount', async () => {
      const { result, unmount } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      unmount()

      expect(mockAudioContext.close).toHaveBeenCalled()
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })

    it('auto-starts listening when supported and not already listening', async () => {
      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      // Wait for auto-start
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100)) // Wait longer than auto-start delay
      })

      expect(result.current.isListening).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles audio context creation errors', async () => {
      window.AudioContext.mockImplementation(() => {
        throw new Error('Audio context failed')
      })

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      expect(result.current.error).toBe('Audio context failed')
      expect(result.current.isSupported).toBe(false)
    })

    it('handles analyser errors during processing', async () => {
      const mockAnalyser = {
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn(() => {
          throw new Error('Analyser error')
        }),
        connect: vi.fn(),
      }

      mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useWakeWord([], mockOnWakeWordDetected))

      await act(async () => {
        await result.current.startListening()
      })

      // Wait for processing
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error in wake word detection:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})
