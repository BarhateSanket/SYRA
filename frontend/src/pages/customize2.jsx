import React, { useContext, useState, useEffect } from 'react'
import { userDataContext } from '../ContextApi/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { FaPlay, FaCheck, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function Customize2() {
    const {
        userData,
        backendImage,
        selectedImage,        // may be File or blob URL
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

    // -----------------------------
    // IMAGE HANDLING FIX START
    // -----------------------------
    const [previewUrl, setPreviewUrl] = useState(null)
    const [uploadFile, setUploadFile] = useState(null) // real File for upload

    useEffect(() => {
        // CASE 1 → User selected a NEW FILE
        if (selectedImage instanceof File) {
            setUploadFile(selectedImage)
            const blobUrl = URL.createObjectURL(selectedImage)
            setPreviewUrl(blobUrl)
            return () => URL.revokeObjectURL(blobUrl)
        }

        // CASE 2 → selectedImage is a blob or URL string
        if (typeof selectedImage === "string") {
            setUploadFile(null)
            setPreviewUrl(selectedImage)
            return
        }

        // CASE 3 → backend image exists
        if (backendImage) {
            setUploadFile(null)
            setPreviewUrl(backendImage)
            return
        }

        // CASE 4 → nothing selected
        setUploadFile(null)
        setPreviewUrl(null)
    }, [selectedImage, backendImage])
    // -----------------------------
    // IMAGE HANDLING FIX END
    // -----------------------------

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

        utterance.pitch = gender === "male" ? 0.7 : 1.3
        utterance.rate = gender === "male" ? 0.8 : 1.1

        const voices = window.speechSynthesis.getVoices()
        utterance.voice = voices.find(v => v.lang === voiceLang) || voices[0]

        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)

        window.speechSynthesis.speak(utterance)
    }

    const handleVoiceSelect = (voiceId) => {
        setSelectedVoice(voiceId)
        const [_, gender] = voiceId.split('-')
        setVoiceSettings(prev => ({
            ...prev,
            voice: voiceId,
            gender
        }))
    }

    // -----------------------------
    // FINAL FIXED UPDATE FUNCTION
    // -----------------------------
    const handleUpdateAssistant = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("assistantName", assistantName)

            // Upload file ONLY if user selected a NEW file
            if (uploadFile instanceof File) {
                formData.append("assistantImage", uploadFile)
            }

            const result = await axios.post(
                `${serverUrl}/api/user/update`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                }
            )

            setUserData(result.data)
            localStorage.setItem("syraVoiceSettings", JSON.stringify(voiceSettings))

            navigate("/")
        } catch (err) {
            console.log("Update error:", err.response?.data || err.message)
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => {
        if (currentStep === 1 && assistantName.trim()) {
            setCurrentStep(2)
        } else if (currentStep === 2) {
            handleUpdateAssistant()
        }
    }

    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1)

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center flex-col p-[20px] relative overflow-hidden'>

            <MdKeyboardBackspace
                className='absolute top-[20px] sm:top-[30px] left-[20px] sm:left-[30px] text-white cursor-pointer w-[20px] h-[20px] hover:scale-110 transition-transform z-20'
                onClick={() => navigate("/customize")}
            />

            {/* Steps */}
            <div className='absolute top-[20px] left-1/2 transform -translate-x-1/2 z-20'>
                <div className='flex items-center gap-2'>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? "bg-purple-400 text-white" : "bg-white/20 text-white/60"}`}>1</div>
                    <div className={`w-8 h-1 ${currentStep >= 2 ? "bg-purple-400" : "bg-white/20"}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? "bg-purple-400 text-white" : "bg-white/20 text-white/60"}`}>2</div>
                </div>
            </div>

            <div className='w-full max-w-2xl relative z-20'>
                
                {/* STEP 1 */}
                {currentStep === 1 && (
                    <div className='text-center'>
                        <h1 className='text-white mb-10 text-3xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'>
                            Enter Your <span className='text-blue-200'>Assistant Name</span>
                        </h1>

                        <input
                            type="text"
                            className='w-full max-w-md h-[60px] bg-white/5 border-2 border-purple-400/50 text-white rounded-full px-5 backdrop-blur-lg'
                            placeholder="eg. Alexa, Siri, Jarvis..."
                            value={assistantName}
                            onChange={e => setAssistantName(e.target.value)}
                        />

                        {/* Preview Image */}
                        <div className='mt-6 flex justify-center'>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    className='w-28 h-28 rounded-full object-cover border border-purple-400'
                                />
                            ) : (
                                <div className='w-28 h-28 rounded-full bg-white/10 flex items-center justify-center text-white/40'>
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* File input */}
                        <div className='mt-4'>
                            <input
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setUploadFile(file)
                                        const blobUrl = URL.createObjectURL(file)
                                        setPreviewUrl(blobUrl)
                                    }
                                }}
                                className='text-white'
                            />
                        </div>

                        <button
                            onClick={nextStep}
                            disabled={!assistantName.trim() || loading}
                            className='px-8 py-4 mt-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full'
                        >
                            Next <FaArrowRight className='inline ml-2' />
                        </button>
                    </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                    <div className='text-center'>
                        <h1 className='text-white mb-10 text-3xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'>
                            Choose Your <span className='text-blue-200'>Assistant Voice</span>
                        </h1>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
                            {voiceOptions.map((voice) => (
                                <div
                                    key={voice.id}
                                    onClick={() => handleVoiceSelect(voice.id)}
                                    className={`p-4 border rounded-2xl cursor-pointer ${
                                        selectedVoice === voice.id
                                            ? "border-purple-400 bg-purple-400/20"
                                            : "border-white/20 bg-white/5"
                                    }`}
                                >
                                    <div className='flex justify-between'>
                                        <span className='text-2xl'>{voice.flag}</span>
                                        {selectedVoice === voice.id && <FaCheck className='text-purple-400' />}
                                    </div>
                                    <div className='text-white mt-2'>{voice.name}</div>
                                    <button
                                        className='mt-2 p-2 bg-purple-400/20 rounded-full'
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            testVoice(voice.id)
                                        }}
                                    >
                                        <FaPlay />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className='flex gap-4 justify-center'>
                            <button
                                onClick={prevStep}
                                className='px-6 py-3 bg-white/10 text-white rounded-full'
                            >
                                <FaArrowLeft /> Back
                            </button>

                            <button
                                onClick={nextStep}
                                disabled={loading}
                                className='px-8 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full'
                            >
                                {loading ? "Saving..." : "Finish"} <FaCheck className='inline ml-1' />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Customize2
