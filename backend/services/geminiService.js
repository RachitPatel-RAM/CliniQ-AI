// CliniQ AI — Gemini API Fallback Service (Stub)
// This service is a placeholder for future Gemini API integration.
// It provides the same interface as gemmaService.js for easy swapping.

/**
 * Analyze patient intake transcript using Google Gemini API
 * @param {Object} patient - { name, age, gender, language }
 * @param {string} transcript - Raw patient speech/text
 * @returns {Promise<Object>} Structured clinical JSON
 */
export async function analyzeWithGemini(patient, transcript) {
    // TODO: Implement with actual Gemini API key
    // const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    // const GEMINI_MODEL = 'gemini-1.5-flash';
    // const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    throw new Error(
        'Gemini fallback service is not configured. ' +
        'Set GEMINI_API_KEY in your .env file to enable the Gemini fallback.'
    );
}
