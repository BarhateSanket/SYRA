import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../ContextApi/UserDataContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
import logo1 from "../assets/logo1.png"
import { FaMicrophone, FaMicrophoneSlash, FaBrain, FaShieldAlt, FaStar, FaCog, FaRocket } from "react-icons/fa";
import Toast from '../components/Toast'
import ProgressBar from '../components/ProgressBar'
import Header from '../components/Header'
import VoiceControls from '../components/VoiceControls'
import commandCache from '../components/CommandCache'
import useWakeWord from '../hooks/useWakeWord'
import useTouchGestures from '../hooks/useTouchGestures'
function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
   const [userText,setUserText]=useState("")
   const [aiText,setAiText]=useState("")
   const isSpeakingRef=useRef(false)
   const recognitionRef=useRef(null)
   const [ham,setHam]=useState(false)
   const isRecognizingRef=useRef(false)
   const synth=window.speechSynthesis
   const [toast, setToast] = useState(null)
   const [processingProgress, setProcessingProgress] = useState(0)
   const [isProcessing, setIsProcessing] = useState(false)
   const [showVoiceSettings, setShowVoiceSettings] = useState(false)
   const [voiceSettings, setVoiceSettings] = useState(() => {
     return JSON.parse(localStorage.getItem('syraVoiceSettings') || '{"voice": "hi-IN-male", "gender": "male", "rate": 1, "pitch": 1, "volume": 1}')
   })

  // Wake word and touch gesture hooks
  const { isListening: wakeWordActive, startListening: startWakeWord, stopListening: stopWakeWord, updateSensitivity } = useWakeWord()
  const touchRef = useRef(null)
  useTouchGestures(touchRef, {
    onSwipeUp: () => setShowVoiceSettings(true),
    onSwipeDown: () => setShowVoiceSettings(false),
    onDoubleTap: () => testVoice(),
    onLongPress: () => setListening(!listening)
  })

  const handleLogOut=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    
   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    try {
      recognitionRef.current?.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }
    
  }

  const speak=(text)=>{
    // Check if speech synthesis is supported and allowed
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      setAiText(text);
      setTimeout(() => {
        setAiText("");
        setTimeout(() => {
          startRecognition();
        }, 800);
      }, 2000);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Parse voice setting to get language and gender preference
    const [lang, gender] = voiceSettings.voice.split('-');
    const voiceLang = lang + (lang.includes('-') ? '' : '-' + (lang === 'en' ? 'US' : 'IN'));

    utterance.lang = voiceLang;
    // Special handling for Hindi male to sound like English UK male
    if (voiceSettings.voice === 'hi-IN-male') {
      utterance.rate = Math.max(0.5, voiceSettings.rate * 0.6); // Much slower like UK English
      utterance.pitch = Math.max(0, voiceSettings.pitch * 0.5); // Much lower pitch
    } else {
      utterance.rate = gender === 'male' ? Math.max(0.5, voiceSettings.rate * 0.8) : voiceSettings.rate * 1.1;
      utterance.pitch = gender === 'male' ? Math.max(0, voiceSettings.pitch * 0.7) : voiceSettings.pitch * 1.3;
    }
    utterance.volume = voiceSettings.volume;

    // Try to find the preferred voice based on language and gender
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    // First try to find voice matching exact language and gender preference
    selectedVoice = voices.find(v =>
      v.lang === voiceLang &&
      ((gender === 'male' && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'))) ||
       (gender === 'female' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('girl'))))
    );

    // If no exact match, try to find any voice for the language
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === voiceLang) ||
                     voices.find(v => v.lang.startsWith(lang));
    }

    // Final fallback to any available voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'hi-IN') ||
                     voices.find(v => v.lang === 'en-US') ||
                     voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log("Selected voice:", selectedVoice.name, "for language:", voiceLang, "gender:", gender);
    }

    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition(); // ⏳ Delay se race condition avoid hoti hai
      }, 800);
    };

    utterance.onerror = (error) => {
      console.warn("Speech synthesis error:", error);
      // Fallback: just set the text without speaking
      setAiText(text);
      setTimeout(() => {
        setAiText("");
        isSpeakingRef.current = false;
        setTimeout(() => {
          startRecognition();
        }, 800);
      }, 2000);
    };

    synth.cancel(); // 🛑 pehle se koi speech ho to band karo

    // Check if speech synthesis is allowed (user activation required)
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }

    // Only speak if we have user activation (after user interaction)
    try {
      synth.speak(utterance);
    } catch (error) {
      console.warn("Speech synthesis failed:", error);
      // Fallback: just set the text without speaking
      setAiText(text);
      setTimeout(() => {
        setAiText("");
        isSpeakingRef.current = false;
        setTimeout(() => {
          startRecognition();
        }, 800);
      }, 2000);
    }
  }

  const updateVoiceSettings = (newSettings) => {
    const updatedSettings = { ...voiceSettings, ...newSettings };
    setVoiceSettings(updatedSettings);
    localStorage.setItem('syraVoiceSettings', JSON.stringify(updatedSettings));
  }

  const testVoice = (text = "Hello! This is a test of your selected voice settings.") => {
    speak(text);
  }

  const handleCommand=(data)=>{
    if (!data || !data.type) {
      console.error("Invalid data received:", data);
      speak("Sorry, I couldn't understand that command.");
      return;
    }
    const {type,userInput,response}=data
      speak(response);

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
     if (type === 'calculator-open') {

      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
     if (type ==="instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type ==="facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
     if (type ==="weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'gmail-read') {
      // Handle Gmail read - this would need backend integration
      console.log('Gmail read command detected');
      // For now, open Gmail
      window.open('https://mail.google.com/', '_blank');
    }
    if (type === 'gmail-send') {
      // Handle Gmail send - this would need backend integration
      console.log('Gmail send command detected');
      // For now, open Gmail compose
      window.open('https://mail.google.com/mail/?view=cm&fs=1', '_blank');
    }
    if (type === 'calendar-events') {
      // Handle calendar events - this would need backend integration
      console.log('Calendar events command detected');
      window.open('https://calendar.google.com/', '_blank');
    }
    if (type === 'calendar-create') {
      // Handle calendar create - this would need backend integration
      console.log('Calendar create command detected');
      window.open('https://calendar.google.com/calendar/u/0/r/eventedit', '_blank');
    }
    if (type === 'drive-files') {
      // Handle drive files - this would need backend integration
      console.log('Drive files command detected');
      window.open('https://drive.google.com/', '_blank');
    }
    if (type === 'photos-search') {
      // Handle photos search - this would need backend integration
      console.log('Photos search command detected');
      window.open('https://photos.google.com/', '_blank');
    }
    if (type === 'youtube-playlists') {
      // Handle YouTube playlists - this would need backend integration
      console.log('YouTube playlists command detected');
      window.open('https://www.youtube.com/feed/library', '_blank');
    }
    if (type === 'youtube-subscriptions') {
      // Handle YouTube subscriptions - this would need backend integration
      console.log('YouTube subscriptions command detected');
      window.open('https://www.youtube.com/feed/subscriptions', '_blank');
    }
    if (type === 'github-repos') {
      // Handle GitHub repos - this would need backend integration
      console.log('GitHub repos command detected');
      window.open('https://github.com/', '_blank');
    }
    if (type === 'github-issues') {
      // Handle GitHub issues - this would need backend integration
      console.log('GitHub issues command detected');
      window.open('https://github.com/', '_blank');
    }
    if (type === 'github-prs') {
      // Handle GitHub PRs - this would need backend integration
      console.log('GitHub PRs command detected');
      window.open('https://github.com/', '_blank');
    }
    if (type === 'github-create-issue') {
      // Handle GitHub create issue - this would need backend integration
      console.log('GitHub create issue command detected');
      window.open('https://github.com/', '_blank');
    }
    if (type === 'github-create-pr') {
      // Handle GitHub create PR - this would need backend integration
      console.log('GitHub create PR command detected');
      window.open('https://github.com/', '_blank');
    }
    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

    // New Smart Home & IoT Features
    if (type === 'weather-current') {
      // Handle current weather - backend integration
      console.log('Current weather command detected');
      // This will be handled by displaying weather data in the UI
    }
    if (type === 'weather-forecast') {
      // Handle weather forecast - backend integration
      console.log('Weather forecast command detected');
      // This will be handled by displaying forecast data in the UI
    }
    if (type === 'news-get') {
      // Handle news fetching - backend integration
      console.log('News command detected');
      // This will be handled by displaying news in the UI
    }
    if (type === 'stocks-quote') {
      // Handle stock quote - backend integration
      console.log('Stock quote command detected');
      // This will be handled by displaying stock data in the UI
    }
    if (type === 'stocks-overview') {
      // Handle stock overview - backend integration
      console.log('Stock overview command detected');
      // This will be handled by displaying stock overview in the UI
    }
    if (type === 'currency-convert') {
      // Handle currency conversion - backend integration
      console.log('Currency conversion command detected');
      // This will be handled by displaying conversion result in the UI
    }
    if (type === 'units-convert') {
      // Handle unit conversion - backend integration
      console.log('Unit conversion command detected');
      // This will be handled by displaying conversion result in the UI
    }
    if (type === 'reminder-create') {
      // Handle reminder creation - backend integration
      console.log('Create reminder command detected');
      // This will be handled by creating reminder via API
    }
    if (type === 'reminder-list') {
      // Handle reminder listing - backend integration
      console.log('List reminders command detected');
      // This will be handled by displaying reminders in the UI
    }
    if (type === 'smarthome-devices') {
      // Handle smart home devices - backend integration
      console.log('Smart home devices command detected');
      // This will be handled by displaying devices in the UI
    }
    if (type === 'smarthome-control') {
      // Handle smart home control - backend integration
      console.log('Smart home control command detected');
      // This will be handled by controlling devices via API
    }

  }

useEffect(() => {
  if (!userData?.assistantName) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("Speech recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  // Start recognition after 1 second delay only if component still mounted
  const startTimeout = setTimeout(() => {
    if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognition.start();
        console.log("Recognition requested to start");
      } catch (e) {
        if (e.name !== "InvalidStateError") {
          console.error(e);
        }
      }
    }
  }, 1000);

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
    console.log("Recognition started");
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
    console.log("Recognition ended");
    if (isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 1000);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 1000);
    }
  };

  recognition.onresult = async (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    console.log("Transcript:", transcript);
    console.log("Assistant name:", userData.assistantName);
    if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
      console.log("Assistant name detected");
      setAiText("");
      setUserText(transcript);
      recognition.stop();
      isRecognizingRef.current = false;
      setListening(false);

      const lowerTranscript = transcript.toLowerCase();
      console.log("Lower transcript:", lowerTranscript);

      // Instant actions for common commands
      if (lowerTranscript.includes('open youtube') || lowerTranscript.includes('play on youtube') || lowerTranscript.includes('youtube search')) {
        console.log("YouTube command detected");
        const query = transcript.replace(new RegExp(userData.assistantName, 'gi'), '').replace(/open youtube|play on youtube|youtube search/gi, '').trim();
        console.log("Query:", query);
        try {
          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
          console.log("YouTube opened successfully");
          setToast({ message: "YouTube opened successfully!", type: "success" })
        } catch (error) {
          console.error("Failed to open YouTube:", error);
          setToast({ message: "Failed to open YouTube", type: "error" })
        }
        speak("Opening YouTube");
        setAiText("Opening YouTube");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open instagram')) {
        console.log("Instagram command detected");
        try {
          window.open('https://www.instagram.com/', '_blank');
          console.log("Instagram opened successfully");
        } catch (error) {
          console.error("Failed to open Instagram:", error);
        }
        speak("Opening Instagram");
        setAiText("Opening Instagram");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open facebook')) {
        console.log("Facebook command detected");
        try {
          window.open('https://www.facebook.com/', '_blank');
          console.log("Facebook opened successfully");
        } catch (error) {
          console.error("Failed to open Facebook:", error);
        }
        speak("Opening Facebook");
        setAiText("Opening Facebook");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open calculator')) {
        console.log("Calculator command detected");
        try {
          window.open('https://www.google.com/search?q=calculator', '_blank');
          console.log("Calculator opened successfully");
        } catch (error) {
          console.error("Failed to open Calculator:", error);
        }
        speak("Opening Calculator");
        setAiText("Opening Calculator");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('show weather') || lowerTranscript.includes('weather')) {
        console.log("Weather command detected");
        try {
          window.open('https://www.google.com/search?q=weather', '_blank');
          console.log("Weather opened successfully");
        } catch (error) {
          console.error("Failed to open Weather:", error);
        }
        speak("Showing weather");
        setAiText("Showing weather");
        setUserText("");
        return;
      }

      // Additional functionalities
      if (lowerTranscript.includes('open gmail') || lowerTranscript.includes('open email')) {
        console.log("Gmail command detected");
        try {
          window.open('https://mail.google.com/', '_blank');
          console.log("Gmail opened successfully");
        } catch (error) {
          console.error("Failed to open Gmail:", error);
        }
        speak("Opening Gmail");
        setAiText("Opening Gmail");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open google') || lowerTranscript.includes('search google')) {
        console.log("Google command detected");
        const query = transcript.replace(new RegExp(userData.assistantName, 'gi'), '').replace(/open google|search google/gi, '').trim();
        try {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
          console.log("Google opened successfully");
        } catch (error) {
          console.error("Failed to open Google:", error);
        }
        speak("Opening Google");
        setAiText("Opening Google");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open twitter') || lowerTranscript.includes('open x')) {
        console.log("Twitter command detected");
        try {
          window.open('https://twitter.com/', '_blank');
          console.log("Twitter opened successfully");
        } catch (error) {
          console.error("Failed to open Twitter:", error);
        }
        speak("Opening Twitter");
        setAiText("Opening Twitter");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open linkedin')) {
        console.log("LinkedIn command detected");
        try {
          window.open('https://www.linkedin.com/', '_blank');
          console.log("LinkedIn opened successfully");
        } catch (error) {
          console.error("Failed to open LinkedIn:", error);
        }
        speak("Opening LinkedIn");
        setAiText("Opening LinkedIn");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open github')) {
        console.log("GitHub command detected");
        try {
          window.open('https://github.com/', '_blank');
          console.log("GitHub opened successfully");
        } catch (error) {
          console.error("Failed to open GitHub:", error);
        }
        speak("Opening GitHub");
        setAiText("Opening GitHub");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open whatsapp')) {
        console.log("WhatsApp command detected");
        try {
          window.open('https://web.whatsapp.com/', '_blank');
          console.log("WhatsApp opened successfully");
        } catch (error) {
          console.error("Failed to open WhatsApp:", error);
        }
        speak("Opening WhatsApp");
        setAiText("Opening WhatsApp");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open spotify')) {
        console.log("Spotify command detected");
        try {
          window.open('https://open.spotify.com/', '_blank');
          console.log("Spotify opened successfully");
        } catch (error) {
          console.error("Failed to open Spotify:", error);
        }
        speak("Opening Spotify");
        setAiText("Opening Spotify");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open netflix')) {
        console.log("Netflix command detected");
        try {
          window.open('https://www.netflix.com/', '_blank');
          console.log("Netflix opened successfully");
        } catch (error) {
          console.error("Failed to open Netflix:", error);
        }
        speak("Opening Netflix");
        setAiText("Opening Netflix");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open maps') || lowerTranscript.includes('open google maps')) {
        console.log("Google Maps command detected");
        try {
          window.open('https://maps.google.com/', '_blank');
          console.log("Google Maps opened successfully");
        } catch (error) {
          console.error("Failed to open Google Maps:", error);
        }
        speak("Opening Google Maps");
        setAiText("Opening Google Maps");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open drive') || lowerTranscript.includes('open google drive')) {
        console.log("Google Drive command detected");
        try {
          window.open('https://drive.google.com/', '_blank');
          console.log("Google Drive opened successfully");
        } catch (error) {
          console.error("Failed to open Google Drive:", error);
        }
        speak("Opening Google Drive");
        setAiText("Opening Google Drive");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open calendar') || lowerTranscript.includes('open google calendar')) {
        console.log("Google Calendar command detected");
        try {
          window.open('https://calendar.google.com/', '_blank');
          console.log("Google Calendar opened successfully");
        } catch (error) {
          console.error("Failed to open Google Calendar:", error);
        }
        speak("Opening Google Calendar");
        setAiText("Opening Google Calendar");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open photos') || lowerTranscript.includes('open google photos')) {
        console.log("Google Photos command detected");
        try {
          window.open('https://photos.google.com/', '_blank');
          console.log("Google Photos opened successfully");
        } catch (error) {
          console.error("Failed to open Google Photos:", error);
        }
        speak("Opening Google Photos");
        setAiText("Opening Google Photos");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open docs') || lowerTranscript.includes('open google docs')) {
        console.log("Google Docs command detected");
        try {
          window.open('https://docs.google.com/', '_blank');
          console.log("Google Docs opened successfully");
        } catch (error) {
          console.error("Failed to open Google Docs:", error);
        }
        speak("Opening Google Docs");
        setAiText("Opening Google Docs");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open sheets') || lowerTranscript.includes('open google sheets')) {
        console.log("Google Sheets command detected");
        try {
          window.open('https://sheets.google.com/', '_blank');
          console.log("Google Sheets opened successfully");
        } catch (error) {
          console.error("Failed to open Google Sheets:", error);
        }
        speak("Opening Google Sheets");
        setAiText("Opening Google Sheets");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open slides') || lowerTranscript.includes('open google slides')) {
        console.log("Google Slides command detected");
        try {
          window.open('https://slides.google.com/', '_blank');
          console.log("Google Slides opened successfully");
        } catch (error) {
          console.error("Failed to open Google Slides:", error);
        }
        speak("Opening Google Slides");
        setAiText("Opening Google Slides");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open classroom') || lowerTranscript.includes('open google classroom')) {
        console.log("Google Classroom command detected");
        try {
          window.open('https://classroom.google.com/', '_blank');
          console.log("Google Classroom opened successfully");
        } catch (error) {
          console.error("Failed to open Google Classroom:", error);
        }
        speak("Opening Google Classroom");
        setAiText("Opening Google Classroom");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open meet') || lowerTranscript.includes('open google meet')) {
        console.log("Google Meet command detected");
        try {
          window.open('https://meet.google.com/', '_blank');
          console.log("Google Meet opened successfully");
        } catch (error) {
          console.error("Failed to open Google Meet:", error);
        }
        speak("Opening Google Meet");
        setAiText("Opening Google Meet");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open translate') || lowerTranscript.includes('open google translate')) {
        console.log("Google Translate command detected");
        try {
          window.open('https://translate.google.com/', '_blank');
          console.log("Google Translate opened successfully");
        } catch (error) {
          console.error("Failed to open Google Translate:", error);
        }
        speak("Opening Google Translate");
        setAiText("Opening Google Translate");
        setUserText("");
        return;
      }

      if (lowerTranscript.includes('open news') || lowerTranscript.includes('open google news')) {
        console.log("Google News command detected");
        try {
          window.open('https://news.google.com/', '_blank');
          console.log("Google News opened successfully");
        } catch (error) {
          console.error("Failed to open Google News:", error);
        }
        speak("Opening Google News");
        setAiText("Opening Google News");
        setUserText("");
        return;
      }

      console.log("No instant action detected, using backend");

      // Check cache first
      const cachedResponse = commandCache.get(transcript);
      if (cachedResponse) {
        console.log("Using cached response");
        handleCommand(cachedResponse);
        setAiText(cachedResponse.response);
        setToast({ message: "Command processed from cache!", type: "success" });
        setUserText("");
        return;
      }

      // For other commands, use backend
      setIsProcessing(true)
      setProcessingProgress(0)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      try {
        const data = await getGeminiResponse(transcript);
        clearInterval(progressInterval)
        setProcessingProgress(100)

        console.log("Gemini response:", data);
        if (data && data.response) {
          // Cache the response for future use
          commandCache.set(transcript, data);

          handleCommand(data);
          setAiText(data.response);
          setToast({ message: "Command processed successfully!", type: "success" })
        } else {
          console.error("Invalid response data:", data);
          speak("Sorry, I couldn't process that request.");
          setAiText("Sorry, I couldn't process that request.");
          setToast({ message: "Failed to process command", type: "error" })
        }
        setUserText("");
      } catch (error) {
        clearInterval(progressInterval)
        console.error("Error getting Gemini response:", error);
        speak("Sorry, I couldn't process that request.");
        setAiText("Sorry, I couldn't process that request.");
        setToast({ message: "Network error - please try again", type: "error" })
        setUserText("");
      } finally {
        setTimeout(() => {
          setIsProcessing(false)
          setProcessingProgress(0)
        }, 500)
      }
    }
  };

  // Speak greeting only if userData is available
  if (userData?.name) {
    const greeting = new SpeechSynthesisUtterance(`Hey boss, tell me what should I do?`);
    // Use the selected voice settings for greeting
    const [lang, gender] = voiceSettings.voice.split('-');
    const voiceLang = lang + (lang.includes('-') ? '' : '-' + (lang === 'en' ? 'US' : 'IN'));

    greeting.lang = voiceLang;
    // Special handling for Hindi male to sound like English UK male
    if (voiceSettings.voice === 'hi-IN-male') {
      greeting.rate = Math.max(0.5, voiceSettings.rate * 0.6); // Much slower like UK English
      greeting.pitch = Math.max(0, voiceSettings.pitch * 0.5); // Much lower pitch
    } else {
      greeting.rate = gender === 'male' ? Math.max(0.5, voiceSettings.rate * 0.8) : voiceSettings.rate * 1.1;
      greeting.pitch = gender === 'male' ? Math.max(0, voiceSettings.pitch * 0.7) : voiceSettings.pitch * 1.3;
    }
    greeting.volume = voiceSettings.volume;

    // Try to find the preferred voice based on language and gender
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    // First try to find voice matching exact language and gender preference
    selectedVoice = voices.find(v =>
      v.lang === voiceLang &&
      ((gender === 'male' && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'))) ||
       (gender === 'female' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('girl'))))
    );

    // If no exact match, try to find any voice for the language
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === voiceLang) ||
                     voices.find(v => v.lang.startsWith(lang));
    }

    // Final fallback to any available voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'hi-IN') ||
                     voices.find(v => v.lang === 'en-US') ||
                     voices[0];
    }

    if (selectedVoice) {
      greeting.voice = selectedVoice;
    }

    window.speechSynthesis.speak(greeting);
  }

  return () => {
    isMounted = false;
    clearTimeout(startTimeout);
    if (recognition) {
      recognition.stop();
    }
    setListening(false);
    isRecognizingRef.current = false;
  };
}, [userData?.assistantName, userData?.name]);




  return (
    <div ref={touchRef} className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-white light:via-gray-50 light:to-gray-100 flex flex-col overflow-hidden relative transition-all duration-300 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:bg-gradient-to-br light:from-white light:via-gray-50 light:to-gray-100'>
      <Header />
      <div className='flex-1 flex justify-center items-center flex-col gap-[20px] pt-16'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse dark:opacity-20 light:opacity-10 dark:mix-blend-multiply light:mix-blend-normal"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000 dark:opacity-20 light:opacity-10 dark:mix-blend-multiply light:mix-blend-normal"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000 dark:opacity-20 light:opacity-10 dark:mix-blend-multiply light:mix-blend-normal"></div>
      </div>

      {/* Premium Header - Mobile Friendly */}
      <div className='absolute top-0 left-0 right-0 z-50 bg-black/20 dark:bg-black/20 light:bg-white/20 backdrop-blur-lg border-b border-white/10 dark:border-white/10 light:border-gray-200/50'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center'>
          {/* Logo Section */}
          <div className='flex items-center gap-2 sm:gap-3'>
            <img src={logo1} alt="Logo" className='w-6 h-6 sm:w-8 sm:h-8' />
            <span className='text-white font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>SYRA AI</span>
            {/* Premium Badge */}
            {userData?.subscriptionStatus === 'active' && userData?.subscriptionPlan !== 'free' && (
              <div className='flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold'>
                <FaStar className='text-xs' />
                PREMIUM
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-2 sm:gap-4'>
            <button className='flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10' onClick={()=>navigate("/customize")}>
              <FaBrain className='text-blue-400' />
              <span>Customize</span>
            </button>
            {/* Premium Features - Only show for premium users */}
            {userData?.premiumFeatures?.advancedAnalytics && (
              <button className='flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10' onClick={()=>navigate("/analytics")}>
                <FaRocket className='text-green-400' />
                <span>Analytics</span>
              </button>
            )}
            <button className='flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10' onClick={handleLogOut}>
              <FaShieldAlt className='text-red-400' />
              <span>Logout</span>
            </button>
            <button className={`flex items-center gap-2 text-xs sm:text-sm transition-colors px-3 py-2 rounded-lg border ${
              userData?.subscriptionStatus === 'active' && userData?.subscriptionPlan !== 'free'
                ? 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'
                : 'text-white/80 hover:text-yellow-400 border-yellow-400/20 hover:border-yellow-400/40 hover:bg-yellow-400/10'
            }`} onClick={()=>navigate("/premium")}>
              <FaStar className='text-yellow-400' />
              <span>{userData?.subscriptionStatus === 'active' && userData?.subscriptionPlan !== 'free' ? 'Premium' : 'Upgrade'}</span>
            </button>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className='flex md:hidden items-center gap-2'>
            <button
              className='text-white w-8 h-8 hover:scale-110 transition-transform cursor-pointer bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg'
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              title="Voice Settings"
            >
              <FaCog className='text-white text-sm' />
            </button>
            <button
              className='text-white w-8 h-8 hover:scale-110 transition-transform cursor-pointer bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg'
              onClick={()=>setHam(true)}
              title="Menu"
            >
              <CgMenuRight className='text-white text-sm' />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Voice Settings Button */}
      <button
        className='hidden md:flex items-center gap-2 text-white/80 hover:text-white text-xs transition-colors px-3 py-2 rounded-lg hover:bg-white/10 absolute top-[20px] right-[200px] z-30'
        onClick={() => setShowVoiceSettings(!showVoiceSettings)}
        title="Voice Settings"
      >
        <FaCog className='text-sm' />
        <span>Voice</span>
      </button>

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4'>
          <div className='bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-lg border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-white text-2xl font-bold flex items-center gap-2'>
                <FaCog className='text-purple-400' />
                Voice Settings
              </h3>
              <button
                onClick={() => setShowVoiceSettings(false)}
                className='text-white/70 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all'
              >
                ×
              </button>
            </div>

            <div className='space-y-6'>
              {/* Voice Gender Selection */}
              <div>
                <label className='text-white font-semibold mb-3 block text-lg'>Choose Voice Gender</label>
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    onClick={() => updateVoiceSettings({ gender: 'male' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      voiceSettings.gender === 'male'
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300 shadow-lg shadow-blue-400/30'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-blue-400/50 hover:bg-blue-400/10'
                    }`}
                  >
                    <div className='text-3xl mb-2'>👨</div>
                    <div className='font-bold text-lg'>Male Voice</div>
                    <div className='text-sm opacity-75'>Deep & Professional</div>
                  </button>
                  <button
                    onClick={() => updateVoiceSettings({ gender: 'female' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      voiceSettings.gender === 'female'
                        ? 'border-pink-400 bg-pink-400/20 text-pink-300 shadow-lg shadow-pink-400/30'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-pink-400/50 hover:bg-pink-400/10'
                    }`}
                  >
                    <div className='text-3xl mb-2'>👩</div>
                    <div className='font-bold text-lg'>Female Voice</div>
                    <div className='text-sm opacity-75'>Clear & Friendly</div>
                  </button>
                </div>
              </div>

              {/* Voice Language Selection */}
              <div>
                <label className='text-white font-semibold mb-3 block text-lg'>Select Language & Voice</label>
                <select
                  value={voiceSettings.voice}
                  onChange={(e) => updateVoiceSettings({ voice: e.target.value })}
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-base'
                >
                  <optgroup label="🌍 English">
                    <option value="en-US-male">🇺🇸 English (US) - Male</option>
                    <option value="en-US-female">🇺🇸 English (US) - Female</option>
                    <option value="en-GB-male">🇬🇧 English (UK) - Male</option>
                    <option value="en-GB-female">🇬🇧 English (UK) - Female</option>
                  </optgroup>
                  <optgroup label="🇮🇳 Hindi">
                    <option value="hi-IN-male">🇮🇳 Hindi (India) - Male</option>
                    <option value="hi-IN-female">🇮🇳 Hindi (India) - Female</option>
                  </optgroup>
                  <optgroup label="🌐 Other Languages">
                    <option value="es-ES-male">🇪🇸 Spanish - Male</option>
                    <option value="es-ES-female">🇪🇸 Spanish - Female</option>
                    <option value="fr-FR-male">🇫🇷 French - Male</option>
                    <option value="fr-FR-female">🇫🇷 French - Female</option>
                    <option value="de-DE-male">🇩🇪 German - Male</option>
                    <option value="de-DE-female">🇩🇪 German - Female</option>
                    <option value="it-IT-male">🇮🇹 Italian - Male</option>
                    <option value="it-IT-female">🇮🇹 Italian - Female</option>
                    <option value="pt-BR-male">🇧🇷 Portuguese - Male</option>
                    <option value="pt-BR-female">🇧🇷 Portuguese - Female</option>
                    <option value="ja-JP-male">🇯🇵 Japanese - Male</option>
                    <option value="ja-JP-female">🇯🇵 Japanese - Female</option>
                    <option value="ko-KR-male">🇰🇷 Korean - Male</option>
                    <option value="ko-KR-female">🇰🇷 Korean - Female</option>
                    <option value="zh-CN-male">🇨🇳 Chinese - Male</option>
                    <option value="zh-CN-female">🇨🇳 Chinese - Female</option>
                  </optgroup>
                </select>
              </div>

              {/* Voice Customization */}
              <div className='space-y-4'>
                <h4 className='text-white font-semibold text-lg'>Voice Customization</h4>

                {/* Speech Rate */}
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <label className='text-white font-medium'>Speech Speed</label>
                    <span className='text-purple-400 font-bold'>{voiceSettings.rate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
                    className='w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-purple'
                  />
                  <div className='flex justify-between text-xs text-white/60 mt-1'>
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Pitch */}
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <label className='text-white font-medium'>Voice Pitch</label>
                    <span className='text-purple-400 font-bold'>{voiceSettings.pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                    className='w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-purple'
                  />
                  <div className='flex justify-between text-xs text-white/60 mt-1'>
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <label className='text-white font-medium'>Volume</label>
                    <span className='text-purple-400 font-bold'>{Math.round(voiceSettings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => updateVoiceSettings({ volume: parseFloat(e.target.value) })}
                    className='w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-purple'
                  />
                  <div className='flex justify-between text-xs text-white/60 mt-1'>
                    <span>Quiet</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>

              {/* Test Voice Button */}
              <button
                onClick={() => testVoice()}
                className='w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2'
              >
                <FaMicrophone className='text-sm' />
                Test Voice Settings
              </button>

              {/* Current Settings Summary */}
              <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                <h5 className='text-white font-semibold mb-2'>Current Settings:</h5>
                <div className='text-white/80 text-sm space-y-1'>
                  <div>Gender: <span className='text-purple-400 capitalize'>{voiceSettings.gender}</span></div>
                  <div>Language: <span className='text-purple-400'>{voiceSettings.voice.split('-').slice(0, -1).join('-')}</span></div>
                  <div>Voice: <span className='text-purple-400 capitalize'>{voiceSettings.voice.split('-').pop()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`absolute md:hidden top-0 w-full h-full bg-black/60 dark:bg-black/60 light:bg-white/60 backdrop-blur-xl p-[20px] flex flex-col gap-[20px] items-start z-40 pt-20 ${ham?"translate-x-0":"translate-x-full"} transition-all duration-300 ease-in-out`}>
        <RxCross1 className='text-white absolute top-[25px] right-[20px] w-[25px] h-[25px] hover:scale-110 transition-transform cursor-pointer' onClick={()=>setHam(false)}/>

        {/* Navigation Buttons */}
        <div className='w-full flex flex-col gap-3'>
          <button className='w-full h-[50px] text-black font-semibold bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-full cursor-pointer text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2' onClick={()=>navigate("/customize")}>
            <FaBrain className='text-sm' />
            Customize Assistant
          </button>
          <button className='w-full h-[50px] text-black font-semibold bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 rounded-full cursor-pointer text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2' onClick={()=>navigate("/profile")}>
            <FaStar className='text-sm' />
            My Profile
          </button>
          <button className='w-full h-[50px] text-black font-semibold bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 rounded-full cursor-pointer text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2' onClick={()=>navigate("/settings")}>
            <FaShieldAlt className='text-sm' />
            Settings
          </button>
          <button className='w-full h-[50px] text-black font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 rounded-full cursor-pointer text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2' onClick={()=>navigate("/legal")}>
            <FaShieldAlt className='text-sm' />
            Legal & Compliance
          </button>
          <button className='w-full h-[50px] text-black font-semibold bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 rounded-full cursor-pointer text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2' onClick={handleLogOut}>
            <FaShieldAlt className='text-sm' />
            Log Out
          </button>
        </div>

        <div className='w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent'></div>
        <h1 className='text-white font-semibold text-[17px] sm:text-[19px] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>Command History</h1>
        <div className='w-full h-[250px] sm:h-[300px] gap-[15px] overflow-y-auto flex flex-col'>
          {userData.history?.map((his, index)=>(
            <div key={index} className='text-gray-300 text-[14px] sm:text-[16px] w-full p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200'>{his}</div>
          ))}
        </div>
      </div>


      {/* Feature Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl px-4 relative z-20 mt-16 sm:mt-20'>
        <div className='bg-white/5 dark:bg-white/5 light:bg-gray-100/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-200/50 transition-all duration-300 group'>
          <div className='text-purple-400 text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform'><FaRocket /></div>
          <h3 className='text-white dark:text-white light:text-gray-900 font-semibold text-xs sm:text-sm'>Lightning Fast</h3>
          <p className='text-white/60 dark:text-white/60 light:text-gray-600 text-xs'>Instant responses</p>
        </div>
        <div className='bg-white/5 dark:bg-white/5 light:bg-gray-100/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-200/50 transition-all duration-300 group'>
          <div className='text-blue-400 text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform'><FaBrain /></div>
          <h3 className='text-white dark:text-white light:text-gray-900 font-semibold text-xs sm:text-sm'>AI Powered</h3>
          <p className='text-white/60 dark:text-white/60 light:text-gray-600 text-xs'>Advanced intelligence</p>
        </div>
        <div className='bg-white/5 dark:bg-white/5 light:bg-gray-100/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-200/50 transition-all duration-300 group'>
          <div className='text-green-400 text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform'><FaShieldAlt /></div>
          <h3 className='text-white dark:text-white light:text-gray-900 font-semibold text-xs sm:text-sm'>Secure</h3>
          <p className='text-white/60 dark:text-white/60 light:text-gray-600 text-xs'>Enterprise security</p>
        </div>
        <div className='bg-white/5 dark:bg-white/5 light:bg-gray-100/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 dark:border-white/10 light:border-gray-200/50 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-200/50 transition-all duration-300 group'>
          <div className='text-pink-400 text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform'><FaStar /></div>
          <h3 className='text-white dark:text-white light:text-gray-900 font-semibold text-xs sm:text-sm'>Premium</h3>
          <p className='text-white/60 dark:text-white/60 light:text-gray-600 text-xs'>Top-tier experience</p>
        </div>
      </div>

      <div className='w-[200px] sm:w-[240px] h-[260px] sm:h-[300px] flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 relative z-20'>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl"></div>
        <img src={userData?.assistantImage || aiImg} alt="" className='w-full h-full object-cover rounded-2xl relative z-10'/>
      </div>

      <h1 className='text-white dark:text-white light:text-gray-900 text-[18px] sm:text-[22px] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent relative z-20 text-center px-4'>I'm {userData?.assistantName}</h1>

      <div className='flex items-center justify-center gap-4 relative z-20'>
        {!aiText && <img src={userImg} alt="" className='w-[150px] sm:w-[180px] drop-shadow-2xl animate-pulse dark:drop-shadow-2xl light:drop-shadow-lg'/>}
        {aiText && <img src={aiImg} alt="" className='w-[150px] sm:w-[180px] drop-shadow-2xl animate-bounce dark:drop-shadow-2xl light:drop-shadow-lg'/>}
      </div>

      <div className='text-center relative z-20 px-4'>
        <h1 className='text-white dark:text-white light:text-gray-900 text-[16px] sm:text-[20px] font-semibold text-wrap bg-white/10 dark:bg-white/10 light:bg-gray-100/50 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 border border-white/20 dark:border-white/20 light:border-gray-200/50 shadow-lg max-w-md mx-auto'>
          {userText ? userText : aiText ? aiText : "Listening for your command..."}
        </h1>
      </div>

      {/* Enhanced Status indicator */}
      <div className='flex flex-col items-center gap-3 relative z-20'>
        <div className='flex items-center gap-2 sm:gap-3 bg-black/20 dark:bg-black/20 light:bg-white/20 backdrop-blur-lg rounded-full px-3 sm:px-4 py-2 border border-white/10 dark:border-white/10 light:border-gray-200/50'>
          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${listening ? 'bg-red-500 animate-pulse shadow-red-500/50 shadow-lg' : 'bg-green-500 shadow-green-500/50 shadow-lg'} transition-all duration-300`}></div>
          <span className='text-white/80 dark:text-white/80 light:text-gray-600 text-xs sm:text-sm font-medium flex items-center gap-2'>
            {listening ? (
              <>
                <FaMicrophone className='text-red-400 animate-pulse text-sm sm:text-base' />
                <span className='hidden sm:inline'>Listening...</span>
                <span className='sm:hidden'>...</span>
              </>
            ) : (
              <>
                <FaMicrophoneSlash className='text-green-400 text-sm sm:text-base' />
                Ready
              </>
            )}
          </span>
        </div>

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className='w-full max-w-xs'>
            <ProgressBar progress={processingProgress} color="blue" className="mb-2" />
            <p className='text-white/60 text-xs text-center'>Processing your command...</p>
          </div>
        )}

        {/* Cache Status Indicator */}
        <div className='flex items-center gap-2 bg-black/20 backdrop-blur-lg rounded-full px-3 py-1 border border-white/10'>
          <div className='w-2 h-2 rounded-full bg-blue-400 animate-pulse'></div>
          <span className='text-white/60 text-xs'>
            Cache: {commandCache.getStats().size} items
          </span>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      </div>


    </div>
  )
}

export default Home
