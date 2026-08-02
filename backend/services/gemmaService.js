// CliniQ AI — Gemma Service (Groq Cloud API & Local Ollama)
import { SYSTEM_PROMPT } from '../config/systemPrompt.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'gemma2-9b-it';

/**
 * Build prompt message from patient data and transcript
 */
function buildUserMessage(patient, transcript) {
    return `Patient Information:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Preferred Language: ${patient.language}

Patient's Description (in ${patient.language}):
"${transcript}"

Extract the clinical intake information from the above and return ONLY the valid JSON object.`;
}

/**
 * Extract clean JSON object from AI string output
 */
function parseClinicalJson(content) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
    }
    return JSON.parse(jsonMatch[0]);
}

/**
 * Analyze patient intake using Groq Cloud API (gemma2-9b-it)
 * @param {Object} patient
 * @param {string} transcript
 * @returns {Promise<Object>}
 */
export async function analyzeWithGroqGemma(patient, transcript) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        throw new Error('GROQ_API_KEY environment variable is not configured.');
    }

    const userMessage = buildUserMessage(patient, transcript);
    console.log(`[GroqGemmaService] Sending request to Groq Cloud API with model ${GROQ_MODEL}`);

    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('Empty response from Groq API');
    }

    console.log('[GroqGemmaService] Successfully received response from Groq Gemma');
    return parseClinicalJson(content);
}

/**
 * Analyze patient intake transcript using Gemma 3:4b via local Ollama
 * @param {Object} patient - { name, age, gender, language }
 * @param {string} transcript - Raw patient speech/text
 * @returns {Promise<Object>} Structured clinical JSON
 */
export async function analyzeIntake(patient, transcript) {
    const userMessage = buildUserMessage(patient, transcript);

    console.log(`[OllamaService] Sending request to ${OLLAMA_URL} with model ${OLLAMA_MODEL}`);

    const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
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

    console.log('[OllamaService] Successfully received response from Ollama');
    return parseClinicalJson(content);
}

