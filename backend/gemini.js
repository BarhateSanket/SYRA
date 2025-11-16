import axios from "axios";

// Convert your existing function into a named export (REQUIRED)
export const getGeminiResponse = async (
  command,
  assistantName,
  userName,
  options = {}
) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const {
      isPremium = false,
      isAdvancedAI = false,
      conversationHistory = [],
      userLanguage = "en",
    } = options;

    let prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.`;

    if (isPremium && isAdvancedAI) {
      prompt += `

PREMIUM FEATURES ENABLED:
- You have access to advanced AI capabilities
- You can maintain conversation context and memory
- You can provide more detailed and helpful responses
- You understand multi-turn conversations better
- You can handle complex queries with more intelligence`;

      if (conversationHistory.length > 0) {
        prompt += `

RECENT CONVERSATION HISTORY:
${conversationHistory
  .slice(-5)
  .map(
    (item, index) =>
      `${index + 1}. User: "${
        typeof item === "string" ? item : item.command
      }"\nAssistant: [Previous response]`
  )
  .join("\n")}

Use this context to provide more personalized and coherent responses.`;
      }
    }

    if (isPremium && userLanguage !== "en") {
      const languageMap = {
        es: "Spanish",
        fr: "French",
        de: "German",
        hi: "Hindi",
        ja: "Japanese",
        ko: "Korean",
        zh: "Chinese",
      };

      const languageName =
        languageMap[userLanguage.split("-")[0]] || "English";

      prompt += `

MULTI-LANGUAGE SUPPORT: The user prefers responses in ${languageName} when possible.`;
    }

    prompt += `

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "...",
  "userInput": "<original sentence>",
  "response": "<short or detailed reply depending on premium>"
}

now your userInput- ${command}`;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    if (isPremium && isAdvancedAI) {
      payload.generationConfig = {
        temperature: 0.7,
        maxOutputTokens: 1024,
      };
    }

    const result = await axios.post(apiUrl, payload);

    if (
      !result.data ||
      !result.data.candidates ||
      !result.data.candidates[0]
    ) {
      throw new Error("Invalid Gemini API response");
    }

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(
      "Gemini API error:",
      error.response?.status,
      error.response?.data
    );
    return null;
  }
};

// Also keep default export for safety
export default getGeminiResponse;

// END OF FILE