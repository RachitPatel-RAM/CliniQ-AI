// CliniQ AI — Gemma 3:4b Service via Local Ollama API
// This is the SINGLE point of Ollama communication. All AI calls go through here.

import { SYSTEM_PROMPT } from '../config/systemPrompt.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

/**
 * Analyze patient intake transcript using Gemma 3:4b via Ollama
 * @param {Object} patient - { name, age, gender, language }
 * @param {string} transcript - Raw patient speech/text
 * @returns {Promise<Object>} Structured clinical JSON
 */
export async function analyzeIntake(patient, transcript) {
    const userMessage = `Patient Information:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Preferred Language: ${patient.language}

Patient's Description (in ${patient.language}):
"${transcript}"

Extract the clinical intake information from the above and return ONLY the valid JSON object.`;

    console.log(`[GemmaService] Sending request to ${OLLAMA_URL} with model ${MODEL}`);

    const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: MODEL,
            stream: false,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.message?.content;

    if (!content) {
        throw new Error('Empty response from Ollama');
    }

    console.log('[GemmaService] Raw Ollama response received, parsing JSON...');

    // Extract JSON from the response (handle potential markdown wrapping)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No valid JSON found in Ollama response');
    }

    try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[GemmaService] Successfully parsed clinical JSON');
        return parsed;
    } catch (parseError) {
        throw new Error(`JSON parse error: ${parseError.message}`);
    }
}
