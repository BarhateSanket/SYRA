import axios from "axios";
import Fuse from "fuse.js";
import pkg from 'hunspell-asm';
const { loadHunspell } = pkg;
import {
  DICTIONARY_API_KEY,
  DICTIONARY_BASE_URL
} from "../config/dictionary.js";

// Load Hunspell for spell checking (this would need dictionary files)
// For now, using a basic word list for demonstration
const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what"
];

const fuse = new Fuse(commonWords, {
  includeScore: true,
  threshold: 0.4
});

/* ============================================================
   GET WORD DEFINITION
=========================================================== */
export const getDefinition = async (req, res) => {
  try {
    const { word } = req.params;

    if (!word || word.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Word parameter is required",
        data: null
      });
    }

    if (!DICTIONARY_API_KEY || DICTIONARY_API_KEY === "your_merriam_webster_api_key_here") {
      return res.status(500).json({
        success: false,
        message: "Dictionary API key not configured",
        data: null
      });
    }

    const response = await axios.get(`${DICTIONARY_BASE_URL}/${encodeURIComponent(word)}`, {
      params: {
        key: DICTIONARY_API_KEY
      }
    });

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No definition found for "${word}"`,
        data: null,
        suggestions: getSpellSuggestions(word)
      });
    }

    // Process Merriam-Webster response
    const definitions = response.data.map(entry => {
      const shortdef = entry.shortdef || [];
      const fl = entry.fl || "unknown"; // functional label (noun, verb, etc.)

      return {
        word: entry.meta?.id || word,
        functionalLabel: fl,
        definitions: shortdef,
        pronunciation: entry.hwi?.prs?.[0]?.mw || null,
        etymology: entry.et?.[0]?.[1] || null
      };
    });

    return res.json({
      success: true,
      message: `Definition for "${word}"`,
      data: definitions
    });
  } catch (error) {
    console.error("Dictionary API error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: `Word "${req.params.word}" not found`,
        data: null,
        suggestions: getSpellSuggestions(req.params.word)
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "API rate limit exceeded. Please try again later.",
        data: null
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch word definition",
      data: null
    });
  }
};

/* ============================================================
   SPELL CHECK WORD
=========================================================== */
export const checkSpelling = async (req, res) => {
  try {
    const { word } = req.params;

    if (!word || word.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Word parameter is required",
        data: null
      });
    }

    // Basic spell check using common words list
    const isCorrect = commonWords.includes(word.toLowerCase());

    let suggestions = [];
    if (!isCorrect) {
      const results = fuse.search(word.toLowerCase());
      suggestions = results.slice(0, 5).map(result => result.item);
    }

    // TODO: Integrate with hunspell-asm for more accurate spell checking
    // const hunspell = await loadHunspell({
    //   aff: fs.readFileSync('path/to/en_US.aff'),
    //   dic: fs.readFileSync('path/to/en_US.dic')
    // });
    // const isCorrect = hunspell.spell(word);
    // const suggestions = hunspell.suggest(word);

    return res.json({
      success: true,
      message: `Spell check for "${word}"`,
      data: {
        word: word,
        isCorrect: isCorrect,
        suggestions: suggestions
      }
    });
  } catch (error) {
    console.error("Spell check error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to perform spell check",
      data: null
    });
  }
};

/* ============================================================
   GET SPELL SUGGESTIONS
=========================================================== */
export const getSpellSuggestions = (word) => {
  if (!word) return [];

  const results = fuse.search(word.toLowerCase());
  return results.slice(0, 5).map(result => result.item);
};