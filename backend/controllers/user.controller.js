 import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
export const getCurrentUser=async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password").populate('currentSubscription')
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
      const updateData = { assistantName };

      if(req.file){
         updateData.assistantImage = await uploadOnCloudinary(req.file.path)
      } else if(imageUrl){
         updateData.assistantImage = imageUrl
      }
      // If neither file nor imageUrl, preserve existing assistantImage

      const user=await User.findByIdAndUpdate(req.userId, updateData, {new:true}).select("-password")
      return res.status(200).json(user)


   } catch (error) {
       return res.status(400).json({message:"updateAssistantError user error"})
   }
}


export const contactForm=async (req,res)=>{
    try {
        const {name,email,subject,message}=req.body
        console.log("Contact form submission:", {name,email,subject,message})

        // Priority support for premium users
        const user = await User.findById(req.userId);
        const isPrioritySupport = user?.premiumFeatures?.prioritySupport || false;

        // Here you would typically send email or save to database
        // For now, we'll just log and return success with priority flag

        return res.status(200).json({
            success:true,
            message: isPrioritySupport ? "Priority support request submitted. We'll respond within 2 hours." : "Message sent successfully",
            data:{name,email,subject},
            prioritySupport: isPrioritySupport
        })
    } catch (error) {
        console.error("Contact form error:", error)
        return res.status(500).json({
            success:false,
            message:"Failed to send message"
        })
    }
}

// Analytics endpoint for premium users
export const getAnalytics=async (req,res)=>{
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user has advanced analytics feature
        if (!user.premiumFeatures?.advancedAnalytics) {
            return res.status(403).json({
                message: "Advanced analytics is a premium feature",
                upgradeRequired: true
            });
        }

        // Calculate analytics from user history
        const history = user.history || [];
        const totalCommands = history.length;

        // Commands by type (simplified - would need actual type tracking)
        const commandTypes = {
            general: history.filter(h => !h.command?.toLowerCase().includes('open') && !h.command?.toLowerCase().includes('search')).length,
            search: history.filter(h => h.command?.toLowerCase().includes('search')).length,
            open: history.filter(h => h.command?.toLowerCase().includes('open')).length
        };

        // Daily usage (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentHistory = history.filter(h => {
            const timestamp = h.timestamp ? new Date(h.timestamp) : new Date();
            return timestamp >= thirtyDaysAgo;
        });

        const dailyUsage = {};
        recentHistory.forEach(h => {
            const date = h.timestamp ? new Date(h.timestamp).toDateString() : new Date().toDateString();
            dailyUsage[date] = (dailyUsage[date] || 0) + 1;
        });

        return res.status(200).json({
            totalCommands,
            commandTypes,
            dailyUsage: Object.entries(dailyUsage).map(([date, count]) => ({ date, count })),
            averageCommandsPerDay: totalCommands / 30,
            mostActiveDay: Object.entries(dailyUsage).reduce((max, [date, count]) =>
                count > max.count ? { date, count } : max, { date: '', count: 0 })
        });

    } catch (error) {
        console.error("Analytics error:", error);
        return res.status(500).json({ message: "Failed to fetch analytics" });
    }
}

// Voice training endpoint for premium users
export const updateVoiceTraining=async (req,res)=>{
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.premiumFeatures?.customVoiceTraining) {
            return res.status(403).json({
                message: "Custom voice training is a premium feature",
                upgradeRequired: true
            });
        }

        const { voicePreferences, customCommands } = req.body;

        // Update user's voice training data
        const updateData = {};
        if (voicePreferences) {
            updateData.voiceTraining = updateData.voiceTraining || {};
            updateData.voiceTraining.preferences = voicePreferences;
        }

        if (customCommands) {
            updateData.voiceTraining = updateData.voiceTraining || {};
            updateData.voiceTraining.customCommands = customCommands;
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");

        return res.status(200).json({
            message: "Voice training updated successfully",
            voiceTraining: updatedUser.voiceTraining
        });

    } catch (error) {
        console.error("Voice training error:", error);
        return res.status(500).json({ message: "Failed to update voice training" });
    }
}

// Conversation export for premium users
export const exportConversation=async (req,res)=>{
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user has conversation export feature
        // Note: This could be a separate feature or part of advanced analytics
        if (!user.premiumFeatures?.advancedAnalytics) {
            return res.status(403).json({
                message: "Conversation export is a premium feature",
                upgradeRequired: true
            });
        }

        const { format = 'json', dateRange } = req.body;

        let history = user.history || [];

        // Filter by date range if provided
        if (dateRange) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            history = history.filter(h => {
                const timestamp = h.timestamp ? new Date(h.timestamp) : new Date();
                return timestamp >= startDate && timestamp <= endDate;
            });
        }

        if (format === 'csv') {
            // Convert to CSV format
            const csvData = history.map((item, index) => ({
                id: index + 1,
                command: typeof item === 'string' ? item : item.command,
                timestamp: item.timestamp || new Date().toISOString(),
                type: 'user_command'
            }));

            return res.status(200).json({
                format: 'csv',
                data: csvData,
                totalItems: csvData.length
            });
        }

        // Default JSON format
        return res.status(200).json({
            format: 'json',
            data: history,
            totalItems: history.length,
            exportedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error("Conversation export error:", error);
        return res.status(500).json({ message: "Failed to export conversation" });
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

       // Check premium features and command limits
       const isPremium = user.subscriptionStatus === 'active' && user.subscriptionPlan !== 'free';
       const hasUnlimitedCommands = user.premiumFeatures?.unlimitedCommands || false;

       // For free users, limit commands per day (example: 10 commands)
       if (!isPremium && !hasUnlimitedCommands) {
           const today = new Date().toDateString();
           const commandCount = user.history.filter(h => new Date(h.timestamp || Date.now()).toDateString() === today).length;

           if (commandCount >= 10) {
               return res.status(429).json({
                   type: "general",
                   userInput: command,
                   response: "You've reached your daily command limit. Upgrade to premium for unlimited commands!",
                   limitReached: true
               });
           }
       }

       user.history.push({ command, timestamp: new Date() });
       await user.save();

       const userName=user.name;
       const assistantName=user.assistantName;
       const isAdvancedAI = user.premiumFeatures?.advancedAI || false;

       console.log("Calling Gemini with:", { command, assistantName, userName, isPremium, isAdvancedAI });

       // Pass premium status to Gemini for enhanced responses
       const result=await geminiResponse(command, assistantName, userName, {
           isPremium,
           isAdvancedAI,
           conversationHistory: user.history.slice(-10), // Last 10 commands for context
           userLanguage: req.headers['accept-language'] || 'en'
       });

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
