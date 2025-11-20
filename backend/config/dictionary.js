const DICTIONARY_API_KEY =
  process.env.DICTIONARY_API_KEY || "your_merriam_webster_api_key_here";

const DICTIONARY_BASE_URL = "https://dictionaryapi.com/api/v3/references/collegiate/json";

// Optional: Warn if API key is missing
if (!process.env.DICTIONARY_API_KEY) {
  console.warn("⚠️ DICTIONARY_API_KEY not set. Dictionary features may not work.");
}

export { DICTIONARY_API_KEY, DICTIONARY_BASE_URL };