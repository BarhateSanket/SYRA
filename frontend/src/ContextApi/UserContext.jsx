import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext=createContext()
function UserContext({children}) {
    const serverUrl=import.meta.env.VITE_API_URL;
    const [userData,setUserData]=useState(null)
    const [frontendImage,setFrontendImage]=useState(null)
     const [backendImage,setBackendImage]=useState(null)
     const [selectedImage,setSelectedImage]=useState(null)
    const handleCurrentUser=async ()=>{
        try {
            const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
            setUserData(result.data)
            console.log(result.data)
        } catch (error) {
            console.log("Current user error:", error.response?.status, error.response?.data)
            setUserData(null)
        }
    }

    const getGeminiResponse=async (command)=>{
 try {
   const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
   console.log("API Response:", result.data);

   // Check if user hit command limit
   if (result.data.limitReached) {
     // Update user data to reflect premium status might need refresh
     handleCurrentUser();
   }

   return result.data
 } catch (error) {
   console.log("API Error:", error.response?.status, error.response?.data)

   // Handle premium upgrade prompts
   if (error.response?.status === 429) {
     return {
       type: "general",
       userInput: command,
       response: "You've reached your daily command limit. Upgrade to premium for unlimited commands!",
       limitReached: true
     }
   }

   // Return a fallback response instead of null
   return {
     type: "general",
     userInput: command,
     response: "I'm experiencing some technical difficulties right now. Please try again in a moment."
   }
 }
    }

    // Premium feature functions
    const getAnalytics=async ()=>{
      try {
        const result=await axios.get(`${serverUrl}/api/user/analytics`,{withCredentials:true})
        return result.data
      } catch (error) {
        console.log("Analytics API Error:", error.response?.data)
        throw error
      }
    }

    const updateVoiceTraining=async (data)=>{
      try {
        const result=await axios.post(`${serverUrl}/api/user/voice-training`, data, {withCredentials:true})
        return result.data
      } catch (error) {
        console.log("Voice Training API Error:", error.response?.data)
        throw error
      }
    }

    const exportConversation=async (options = {})=>{
      try {
        const result=await axios.post(`${serverUrl}/api/user/export-conversation`, options, {withCredentials:true})
        return result.data
      } catch (error) {
        console.log("Export Conversation API Error:", error.response?.data)
        throw error
      }
    }

    useEffect(()=>{
handleCurrentUser()
    },[])
    const value={
serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
    }
  return (
    <div>
    <userDataContext.Provider value={value}>
      {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
