import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"


// ====================== GET CURRENT USER ======================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(400).json({ message: "user not found" })
    }

    return res.status(200).json(user)
  } catch (error) {
    return res.status(400).json({ message: "get current user error" })
  }
}



// ====================== UPDATE ASSISTANT (FIXED) ======================
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName } = req.body;

    if (!assistantName) {
      return res.status(400).json({ message: "Assistant name is required" });
    }

    // Fetch current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let assistantImage = user.assistantImage;  // keep old image by default

    // If user uploaded a new image
    if (req.file) {
      const uploadedUrl = await uploadOnCloudinary(req.file.path);
      assistantImage = uploadedUrl;   // replace image
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error("updateAssistant error:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};




// ====================== CONTACT FORM ======================
export const contactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    console.log("Contact form submission:", { name, email, subject, message })

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: { name, email, subject }
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    })
  }
}



// ====================== ASK TO ASSISTANT ======================
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body
    console.log("Received command:", command);

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ response: "User not found" })
    }

    user.history.push(command)
    await user.save()

    const userName = user.name
    const assistantName = user.assistantName

    const result = await geminiResponse(command, assistantName, userName)
    console.log("Gemini raw result:", result)

    if (!result) {
      return res.status(500).json({ response: "Failed to get response from Gemini" })
    }

    const jsonMatch = result.match(/{[\s\S]*}/)
    if (!jsonMatch) {
      return res.status(400).json({ response: "sorry, i can't understand" })
    }

    let gemResult
    try {
      gemResult = JSON.parse(jsonMatch[0])
    } catch (err) {
      return res.status(400).json({ response: "Invalid response format from assistant" })
    }

    const type = gemResult.type

    switch (type) {
      case 'get-date':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current date is ${moment().format("YYYY-MM-DD")}`
        })

      case 'get-time':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current time is ${moment().format("hh:mm A")}`
        })

      case 'get-day':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("dddd")}`
        })

      case 'get-month':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("MMMM")}`
        })

      case 'google-search':
      case 'youtube-search':
      case 'youtube-play':
      case 'general':
      case 'calculator-open':
      case 'instagram-open':
      case 'facebook-open':
      case 'weather-show':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response
        })

      default:
        return res.status(400).json({ response: "I didn't understand that command." })
    }

  } catch (error) {
    console.error("Ask assistant error:", error)
    return res.status(500).json({ response: "ask assistant error", error: error.message })
  }
}
