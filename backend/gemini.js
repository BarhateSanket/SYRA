import axios from "axios"

const geminiResponse = async (command, assistantName, userName, options = {}) => {
    try {
        const apiUrl = process.env.GEMINI_API_URL;
        const {
            isPremium = false,
            isAdvancedAI = false,
            conversationHistory = [],
            userLanguage = 'en'
        } = options;

        // Enhanced prompt for premium users
        let prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.`;

        // Add premium features to prompt
        if (isPremium && isAdvancedAI) {
            prompt += `

PREMIUM FEATURES ENABLED:
- You have access to advanced AI capabilities
- You can maintain conversation context and memory
- You can provide more detailed and helpful responses
- You understand multi-turn conversations better
- You can handle complex queries with more intelligence`;

            // Add conversation history for context (last 5 interactions)
            if (conversationHistory.length > 0) {
                prompt += `

RECENT CONVERSATION HISTORY:
${conversationHistory.slice(-5).map((item, index) =>
    `${index + 1}. User: "${typeof item === 'string' ? item : item.command}"
Assistant: [Previous response]`
).join('\n')}

Use this context to provide more personalized and coherent responses.`;
            }
        }

        // Multi-language support for premium users
        if (isPremium && userLanguage !== 'en') {
            const languageMap = {
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
                'hi': 'Hindi',
                'ja': 'Japanese',
                'ko': 'Korean',
                'zh': 'Chinese'
            };
            const languageName = languageMap[userLanguage.split('-')[0]] || 'English';
            prompt += `

MULTI-LANGUAGE SUPPORT: The user prefers responses in ${languageName} when possible.`;
        }

        prompt += `

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show" | "gmail-read" | "gmail-send" | "calendar-events" | "calendar-create" | "drive-files" | "photos-search" | "youtube-playlists" | "youtube-subscriptions" | "github-repos" | "github-issues" | "github-prs" | "github-create-issue" | "github-create-pr"
  ,
  "userInput": "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,

  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": ${isPremium && isAdvancedAI ?
    'A detailed, helpful, and contextually aware response. For premium users, you can provide more comprehensive answers and maintain conversation flow.' :
    'A short voice-friendly reply, e.g., "Sure, playing it now", "Here\'s what I found", "Today is Tuesday", etc.'}

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho ${isPremium && isAdvancedAI ? 'bas detailed answer dena premium users ke liye' : 'bas short answer dena'}
- "google-search": if user wants to search something on Google .
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to  open a calculator .
- "instagram-open": if user wants to  open instagram .
- "facebook-open": if user wants to open facebook.
 -"weather-show": if user wants to know weather
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.
- "gmail-read": if user wants to read emails.
- "gmail-send": if user wants to send an email.
- "calendar-events": if user wants to check calendar events.
- "calendar-create": if user wants to create a calendar event.
- "drive-files": if user wants to list Google Drive files.
- "photos-search": if user wants to search Google Photos.
- "youtube-playlists": if user wants to view YouTube playlists.
- "youtube-subscriptions": if user wants to view YouTube subscriptions.
- "github-repos": if user wants to view their GitHub repositories.
- "github-issues": if user wants to view GitHub issues for a repository.
- "github-prs": if user wants to view GitHub pull requests for a repository.
- "github-create-issue": if user wants to create a new GitHub issue.
- "github-create-pr": if user wants to create a new GitHub pull request.

Important:
- Use ${userName} agar koi puche tume kisne banaya
- Only respond with the JSON object, nothing else.
${isPremium && isAdvancedAI ? '- For premium users, leverage conversation history for more personalized responses.' : ''}


now your userInput- ${command}`;

        console.log("Making Gemini API call to:", apiUrl);
        console.log("Premium features enabled:", { isPremium, isAdvancedAI, userLanguage });

        const requestPayload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        };

        // Use higher model for premium users if available
        if (isPremium && isAdvancedAI) {
            // Could use a more advanced model here if available
            requestPayload.generationConfig = {
                temperature: 0.7, // More creative for premium
                maxOutputTokens: 1024 // Longer responses
            };
        }

        console.log("Request payload:", requestPayload);

        const result = await axios.post(apiUrl, requestPayload);

        console.log("Gemini API response status:", result.status);
        console.log("Gemini API response:", result.data);

        if (!result.data || !result.data.candidates || !result.data.candidates[0]) {
            console.error("Invalid Gemini API response structure:", result.data);
            throw new Error("Invalid Gemini API response");
        }

        return result.data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Gemini API error:", error.response?.status, error.response?.data);
        console.error("Error details:", error.message);
        return null;
    }
}

export default geminiResponse