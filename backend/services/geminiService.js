// CliniQ AI — Google Gemini API Fallback Service
import { SYSTEM_PROMPT } from '../config/systemPrompt.js';

/**
 * Analyze patient intake transcript using Google Gemini API
 * @param {Object} patient - { name, age, gender, language }
 * @param {string} transcript - Raw patient speech/text
 * @returns {Promise<Object>} Structured clinical JSON
 */
export async function analyzeWithGemini(patient, transcript) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

    const promptText = `${SYSTEM_PROMPT}

Patient Information:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Preferred Language: ${patient.language}

Patient Narrative (in ${patient.language}):
"${transcript}"

Extract the clinical intake information and return ONLY valid JSON.`;

    console.log(`[GeminiService] Sending request to Google Gemini API (${geminiModel})`);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: promptText }]
                }
            ],
            generationConfig: {
                response_mime_type: 'application/json'
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
        throw new Error('Empty response received from Gemini API');
    }

    const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
    }

    console.log('[GeminiService] Successfully received response from Gemini API');
    return JSON.parse(jsonMatch[0]);
}

