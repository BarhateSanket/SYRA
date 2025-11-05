import React, { useContext, useRef, useState } from 'react'
import Card from '../components/card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../ContextApi/UserContext'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";
function Customize() {
  const { serverUrl, userData, setUserData, backendImage, setBackendImage, frontendImage, setFrontendImage, selectedImage, setSelectedImage } = useContext(userDataContext)
  const navigate=useNavigate()
      const inputImage=useRef()

      console.log("Customize component state:", { selectedImage, frontendImage, backendImage })

     const handleImage=(e)=>{
const file=e.target.files[0]
console.log("File selected:", file)
setBackendImage(file)
setFrontendImage(URL.createObjectURL(file))
setSelectedImage("input")
     }
  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center flex-col p-[20px] relative overflow-hidden'>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <MdKeyboardBackspace className='absolute top-[20px] sm:top-[30px] left-[20px] sm:left-[30px] text-white cursor-pointer w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] hover:scale-110 transition-transform z-20' onClick={()=>navigate("/")}/>
      <h1 className='text-white mb-[30px] sm:mb-[40px] text-[24px] sm:text-[30px] text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent relative z-20 px-4'>Select your <span className='text-blue-200'>Assistant Image</span></h1>

      <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[10px] sm:gap-[15px] relative z-20 px-4'>
        <Card image={image1}/>
        <Card image={image2}/>
        <Card image={image3}/>
        <Card image={image4}/>
        <Card image={image5}/>
        <Card image={image6}/>
        <Card image={image7}/>
        <div className={`w-[60px] h-[120px] sm:w-[70px] sm:h-[140px] lg:w-[150px] lg:h-[250px] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer hover:border-4 hover:border-purple-400 flex items-center justify-center transition-all duration-300 hover:scale-105 ${selectedImage=="input"?"border-4 border-purple-400 shadow-2xl shadow-purple-500/30 scale-105":null}` } onClick={()=>{
          inputImage.current.click()
          setSelectedImage("input")
        }}>
          {!frontendImage &&  <RiImageAddLine className='text-purple-400 w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] hover:scale-110 transition-transform'/>}
          {frontendImage && <img src={frontendImage} className='h-full object-cover rounded-2xl'/>}
        </div>
        <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
      </div>

      {(selectedImage || frontendImage) && (
        <div className='flex flex-col items-center gap-4 relative z-20'>
          {console.log("Rendering next button, selectedImage:", selectedImage, "frontendImage:", frontendImage)}
          {(selectedImage && selectedImage !== "input") && (
            <div className='w-[100px] h-[150px] sm:w-[120px] sm:h-[180px] rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-400'>
              <img src={selectedImage} alt="Selected" className='w-full h-full object-cover' />
            </div>
          )}
          {frontendImage && (
            <div className='w-[100px] h-[150px] sm:w-[120px] sm:h-[180px] rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-400'>
              <img src={frontendImage} alt="Uploaded" className='w-full h-full object-cover' />
            </div>
          )}
          <button className='min-w-[140px] sm:min-w-[150px] h-[50px] sm:h-[60px] text-black font-semibold cursor-pointer bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-full text-[16px] sm:text-[19px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105' onClick={()=>navigate("/customize2")}>Next</button>
        </div>
      )}

    </div>
  )
}

export default Customize
