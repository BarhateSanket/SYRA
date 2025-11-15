import React, { useContext, useState, useEffect } from 'react'
import { userDataContext } from '../ContextApi/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { FaMicrophone, FaPlay, FaCheck, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function Customize2() {
    const {
        userData,
        backendImage,
        selectedImage,
        serverUrl,
        setUserData
    } = useContext(userDataContext)

    const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const navigate = useNavigate()

    const [voiceSettings, setVoiceSettings] = useState(() => {
        return JSON.parse(localStorage.getItem('syraVoiceSettings')
            || '{"voice": "hi-IN-male", "gender": "male", "rate": 1, "pitch": 1, "volume": 1}')
    })

    const [selectedVoice, setSelectedVoice] = useState(voiceSettings.voice)
    const [isPlaying, setIsPlaying] = useState(false)

    const voiceOptions = [
        { id: 'hi-IN-male', name: 'Hindi Male', lang: 'Hindi', gender: 'Male', flag: '🇮🇳', sample: 'नमस्ते! मैं आपकी मदद करने के लिए तैयार हूं।' },
        { id: 'hi-IN-female', name: 'Hindi Female', lang: 'Hindi', gender: 'Female', flag: '🇮🇳', sample: 'नमस्ते! मैं आपकी सहायक हूं।' },
        { id: 'en-US-male', name: 'English US Male', lang: 'English', gender: 'Male', flag: '🇺🇸', sample: 'Hello! I\'m here to help you.' },
        { id: 'en-US-female', name: 'English US Female', lang: 'English', gender: 'Female', flag: '🇺🇸', sample: 'Hi there! How can I assist you?' },
        { id: 'en-GB-male', name: 'English UK Male', lang: 'English', gender: 'Male', flag: '🇬🇧', sample: 'Hello! I\'m your assistant.' },
        { id: 'en-GB-female', name: 'English UK Female', lang: 'English', gender: 'Female', flag: '🇬🇧', sample: 'Greetings! How may I help?' }
    ]

    const testVoice = (voiceId) => {
        if (isPlaying) return
        setIsPlaying(true)

        const utterance = new SpeechSynthesisUtterance()
        const voiceOption = voiceOptions.find(v => v.id === voiceId)
        if (voiceOption) utterance.text = voiceOption.sample

        const [lang, gender] = voiceId.split('-')
        const voiceLang = lang + (lang.includes('-') ? '' : '-' + (lang === 'en' ? 'US' : 'IN'))
        utterance.lang = voiceLang

        if (voiceId === 'hi-IN-male') {
            utterance.rate = 0.6
            utterance.pitch = 0.5
        } else {
            utterance.rate = gender === 'male' ? 0.8 : 1.1
            utterance.pitch = gender === 'male' ? 0.7 : 1.3
        }

        utterance.volume = 1

        const voices = window.speechSynthesis.getVoices()
        let selectedVoice = null

        if (gender === 'male') {
            selectedVoice = voices.find(v =>
                v.lang === voiceLang &&
                (v.name.toLowerCase().includes('male') ||
                    v.name.toLowerCase().includes('man') ||
                    v.name.toLowerCase().includes('david') ||
                    v.name.toLowerCase().includes('alex') ||
                    v.name.toLowerCase().includes('fred'))
            )
        } else {
            selectedVoice = voices.find(v =>
                v.lang === voiceLang &&
                (v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('woman') ||
                    v.name.toLowerCase().includes('girl') ||
                    v.name.toLowerCase().includes('samantha') ||
                    v.name.toLowerCase().includes('victoria') ||
                    v.name.toLowerCase().includes('susan'))
            )
        }

        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang === voiceLang) ||
                voices.find(v => v.lang.startsWith(lang))
        }

        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang === 'hi-IN') ||
                voices.find(v => v.lang === 'en-US') ||
                voices[0]
        }

        utterance.voice = selectedVoice
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)

        window.speechSynthesis.speak(utterance)
    }

    const handleVoiceSelect = (voiceId) => {
        setSelectedVoice(voiceId)
        const [lang, gender] = voiceId.split('-')
        setVoiceSettings(prev => ({
            ...prev,
            voice: voiceId,
            gender: gender
        }))
    }

    // ********************************************************************
    // ✅ FINAL FIXED UPDATE FUNCTION — NO "file is not defined" EVER AGAIN
    // ********************************************************************
    const handleUpdateAssistant = async () => {
        setLoading(true)
        try {

            let formData = new FormData()
            formData.append("assistantName", assistantName)

            // Upload only if user selects a NEW FILE
            if (selectedImage instanceof File) {
                formData.append("assistantImage", selectedImage)
            }

            // If selectedImage is a URL or backendImage exists:
            // ❌ DO NOT upload image
            // Backend keeps existing image automatically

            const result = await axios.post(
                `${serverUrl}/api/user/update`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            setLoading(false)
            setUserData(result.data)

            localStorage.setItem('syraVoiceSettings', JSON.stringify(voiceSettings))

            navigate("/")

        } catch (error) {
            setLoading(false)
            console.log("Update error:", error.response?.data || error.message)
        }
    }

    const nextStep = () => {
        if (currentStep === 1 && assistantName.trim()) {
            setCurrentStep(2)
        } else if (currentStep === 2) {
            handleUpdateAssistant()
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center flex-col p-[20px] relative overflow-hidden'>

            <MdKeyboardBackspace
                className='absolute top-[20px] sm:top-[30px] left-[20px] sm:left-[30px] text-white cursor-pointer w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] hover:scale-110 transition-transform z-20'
                onClick={() => navigate("/customize")}
            />

            <div className='absolute top-[20px] left-1/2 transform -translate-x-1/2 z-20'>
                <div className='flex items-center gap-2'>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? 'bg-purple-400 text-white' : 'bg-white/20 text-white/60'}`}>
                        1
                    </div>
                    <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-purple-400' : 'bg-white/20'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? 'bg-purple-400 text-white' : 'bg-white/20 text-white/60'}`}>
                        2
                    </div>
                </div>
            </div>

            <div className='w-full max-w-2xl relative z-20'>
                {currentStep === 1 && (
                    <div className='text-center'>
                        <h1 className='text-white mb-[30px] sm:mb-[40px] text-[24px] sm:text-[30px] bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'>
                            Enter Your <span className='text-blue-200'>Assistant Name</span>
                        </h1>

                        <div className='mb-8'>
                            <input
                                type="text"
                                placeholder='eg. Alexa, Siri, Jarvis...'
                                className='w-full max-w-md h-[60px] outline-none border-2 border-purple-400/50 bg-white/5 backdrop-blur-lg text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 mx-auto block'
                                required
                                onChange={(e) => setAssistantName(e.target.value)}
                                value={assistantName}
                                onKeyPress={(e) => e.key === 'Enter' && nextStep()}
                            />
                        </div>

                        <button
                            className='px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={!assistantName.trim() || loading}
                            onClick={nextStep}
                        >
                            Next: Choose Voice <FaArrowRight className='inline ml-2' />
                        </button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className='text-center'>
                        <h1 className='text-white mb-[30px] sm:mb-[40px] text-[24px] sm:text-[30px] bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'>
                            Choose Your <span className='text-blue-200'>Assistant Voice</span>
                        </h1>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
                            {voiceOptions.map((voice) => (
                                <div
                                    key={voice.id}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                        selectedVoice === voice.id
                                            ? 'border-purple-400 bg-purple-400/20 shadow-lg shadow-purple-400/30'
                                            : 'border-white/20 bg-white/5 hover:border-purple-400/50'
                                    }`}
                                    onClick={() => handleVoiceSelect(voice.id)}
                                >
                                    <div className='flex items-center justify-between mb-3'>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-2xl'>{voice.flag}</span>
                                            <div className='text-left'>
                                                <div className='text-white font-semibold'>{voice.name}</div>
                                                <div className='text-white/60 text-sm'>{voice.lang} • {voice.gender}</div>
                                            </div>
                                        </div>
                                        {selectedVoice === voice.id && <FaCheck className='text-purple-400 text-xl' />}
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <div className='text-white/80 text-sm italic'>
                                            "{voice.sample.length > 30 ? voice.sample.substring(0, 30) + '...' : voice.sample}"
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                testVoice(voice.id)
                                            }}
                                            disabled={isPlaying}
                                            className='p-2 bg-purple-400/20 hover:bg-purple-400/30 rounded-full transition-colors disabled:opacity-50'
                                        >
                                            <FaPlay className='text-purple-400 text-sm' />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='flex gap-4 justify-center'>
                            <button
                                className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300 flex items-center gap-2'
                                onClick={prevStep}
                            >
                                <FaArrowLeft /> Back
                            </button>

                            <button
                                className='px-8 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                                disabled={loading}
                                onClick={nextStep}
                            >
                                {loading ? 'Creating...' : 'Create Assistant'}
                                {!loading && <FaCheck className='text-sm' />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Customize2
