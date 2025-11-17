import React, { useContext } from 'react'
import { userDataContext } from '../ContextApi/UserContext'

function Card({image}) {
      const {serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(UserDataContext)
  return (
    <div className={`w-[60px] h-[120px] sm:w-[70px] sm:h-[140px] lg:w-[150px] lg:h-[250px] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer hover:border-4 hover:border-purple-400 transition-all duration-300 hover:scale-105 ${selectedImage==image?"border-4 border-purple-400 shadow-2xl shadow-purple-500/30 scale-105":null}`} onClick={async ()=>{
        console.log("Card clicked, processing image:", image);
        setBackendImage(null)
        setFrontendImage(null)
        // Fetch the image and create a file for upload
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], 'selected-image.png', { type: blob.type });
          setBackendImage(file);
          setFrontendImage(URL.createObjectURL(file));
          setSelectedImage(image); // Set selectedImage after processing completes
        } catch (error) {
          console.error("Error fetching image:", error);
          setSelectedImage(null);
        }
        }}>
      <img src={image} className='h-full object-cover rounded-2xl'  />
    </div>
  )
}

export default Card
