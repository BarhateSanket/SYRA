 import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
 export const getCurrentUser=async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
return res.status(400).json({message:"user not found"})
        }

   return res.status(200).json(user)     
    } catch (error) {
       return res.status(400).json({message:"get current user error"}) 
    }
}

export const updateAssistant=async (req,res)=>{
   try {
      const {assistantName,imageUrl}=req.body
      let assistantImage;
if(req.file){
   assistantImage=await uploadOnCloudinary(req.file.path)
}else{
   assistantImage=imageUrl
}

const user=await User.findByIdAndUpdate(req.userId,{
   assistantName,assistantImage
},{new:true}).select("-password")
return res.status(200).json(user)

      
   } catch (error) {
       return res.status(400).json({message:"updateAssistantError user error"}) 
   }
}


export const contactForm=async (req,res)=>{
    try {
        const {name,email,subject,message}=req.body
        console.log("Contact form submission:", {name,email,subject,message})

        // Here you would typically send email or save to database
        // For now, we'll just log and return success

        return res.status(200).json({
            success:true,
            message:"Message sent successfully",
            data:{name,email,subject}
        })
    } catch (error) {
        console.error("Contact form error:", error)
        return res.status(500).json({
            success:false,
            message:"Failed to send message"
        })
    }
}

export const askToAssistant=async (req,res)=>{
    try {
       const {command}=req.body
       console.log("Received command:", command);
       const user=await User.findById(req.userId);
       if (!user) {
         return res.status(404).json({ response: "User not found" });
       }
       user.history.push(command)
       await user.save()
       const userName=user.name
       const assistantName=user.assistantName
       console.log("Calling Gemini with:", { command, assistantName, userName });
       const result=await geminiResponse(command,assistantName,userName)
       console.log("Gemini raw result:", result);

       if (!result) {
           console.error("Gemini response is null/undefined");
           // Return a fallback response instead of error
           return res.json({
               type: "general",
               userInput: command,
               response: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
           });
       }

      const jsonMatch=result.match(/{[\s\S]*}/)
      console.log("JSON match result:", jsonMatch);
      if(!jsonMatch){
         console.error("No JSON found in Gemini response");
         // Return a fallback response instead of error
         return res.json({
             type: "general",
             userInput: command,
             response: "I didn't quite understand that. Could you please rephrase your request?"
         });
      }
      let gemResult;
      try {
          gemResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
          console.error("JSON parse error:", parseError);
          // Return a fallback response instead of error
          return res.json({
              type: "general",
              userInput: command,
              response: "I'm having trouble understanding your request. Please try again."
          });
      }
      console.log(gemResult)
      const type=gemResult.type

      switch(type){
         case 'get-date' :
            return res.json({
               type,
               userInput:gemResult.userInput,
               response:`current date is ${moment().format("YYYY-MM-DD")}`
            });
            case 'get-time':
                return res.json({
               type,
               userInput:gemResult.userInput,
               response:`current time is ${moment().format("hh:mm A")}`
            });
             case 'get-day':
                return res.json({
               type,
               userInput:gemResult.userInput,
               response:`today is ${moment().format("dddd")}`
            });
            case 'get-month':
                return res.json({
               type,
               userInput:gemResult.userInput,
               response:`today is ${moment().format("MMMM")}`
            });
      case 'google-search':
      case 'youtube-search':
      case 'youtube-play':
      case 'general':
      case  "calculator-open":
      case "instagram-open":
       case "facebook-open":
       case "weather-show" :
         return res.json({
            type,
            userInput:gemResult.userInput,
            response:gemResult.response,
         });

         default:
            return res.json({
                type: "general",
                userInput: command,
                response: "I didn't understand that command. Please try asking something else."
            });
      }


   } catch (error) {
  console.error("Ask assistant error:", error);
  // Return a fallback response instead of error
  return res.json({
      type: "general",
      userInput: req.body.command || "unknown command",
      response: "I'm experiencing some technical difficulties. Please try again in a moment."
  });
   }
}
