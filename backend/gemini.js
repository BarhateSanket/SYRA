import axios from "axios";

export const getGeminiResponse = async (
  command,
  assistantName,
  userName,
  options = {}
) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY");
      return null;
    }

    const {
      isPremium = false,
      isAdvancedAI = false,
      conversationHistory = [],
      userLanguage = "en",
    } = options;

    // SYSTEM + USER PROMPT
    let prompt = `
You are an AI assistant named ${assistantName}, created by ${userName}.
Always reply ONLY in the following JSON format:

{
  "type": "general",
  "userInput": "<user sentence>",
  "response": "<your reply>"
}

NEVER output anything except valid JSON.

User Input: "${command}"
`;

    if (isPremium && isAdvancedAI) {
      prompt += `
PREMIUM MODE:
- Provide smarter, more detailed responses.
- Maintain short-term memory of last 10 messages.
`;
    }

    // CONVERSATION MEMORY FOR PREMIUM USERS
    if (isPremium && conversationHistory.length > 0) {
      const lastFew = conversationHistory
        .slice(-5)
        .map(
          (it) =>
            `User: "${typeof it === "string" ? it : it.command}", Assistant: "[previous reply]"`
        )
        .join("\n");

      prompt += `
RECENT HISTORY:
${lastFew}
`;
    }

    // MULTI-LANGUAGE SUPPORT
    if (isPremium && userLanguage !== "en") {
      prompt += `
User prefers replies in: ${userLanguage}.
`;
    }

    // Gemini v1.5 request format
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    // OFFICIAL GEMINI 1.5 FLASH ENDPOINT
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const result = await axios.post(url, payload);

    const text =
      result.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!text) {
      console.error("❌ Empty Gemini response");
      return null;
    }

    return text;
  } catch (error) {
    console.error(
      "❌ Gemini API error:",
      error.response?.status,
      error.response?.data
    );
    return null;
  }
};

export default getGeminiResponse;
