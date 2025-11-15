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
   return result.data
 } catch (error) {
   console.log("API Error:", error.response?.status, error.response?.data)
   // Return a fallback response instead of null
   return {
     type: "general",
     userInput: command,
     response: "I'm experiencing some technical difficulties right now. Please try again in a moment."
   }
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
