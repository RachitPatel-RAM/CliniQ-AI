// CliniQ AI — Intake Controller
import { analyzeWithGroqGemma, analyzeIntake as analyzeWithOllama } from '../services/gemmaService.js';
import { analyzeWithGemini } from '../services/geminiService.js';

/**
 * POST /api/intake
 * Accepts patient data + transcript, returns structured clinical JSON
 */
export async function handleIntake(req, res) {
    const { patient, transcript } = req.body;

    // Validate required fields
    if (!patient || !transcript) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: patient and transcript'
        });
    }

    if (!patient.name || !patient.age || !patient.gender) {
        return res.status(400).json({
            success: false,
            error: 'Patient must include name, age, and gender'
        });
    }

    console.log(`[IntakeController] Processing intake for patient: ${patient.name}, language: ${patient.language}`);

    const errors = {};

    // Tier 1: Groq Cloud API (gemma2-9b-it)
    if (process.env.GROQ_API_KEY) {
        try {
            const result = await analyzeWithGroqGemma(patient, transcript);
            console.log('[IntakeController] Groq Gemma analysis complete');
            return res.json({
                success: true,
                model: process.env.GROQ_MODEL || 'gemma2-9b-it',
                provider: 'groq-gemma',
                data: result
            });
        } catch (err) {
            console.warn('[IntakeController] Groq Gemma Tier 1 failed:', err.message);
            errors.groq = err.message;
        }
    } else {
        console.log('[IntakeController] Skipping Groq Tier 1 (GROQ_API_KEY not set)');
    }

    // Tier 2: Local Ollama (gemma3:4b)
    try {
        const result = await analyzeWithOllama(patient, transcript);
        console.log('[IntakeController] Local Ollama Gemma analysis complete');
        return res.json({
            success: true,
            model: process.env.OLLAMA_MODEL || 'gemma3:4b',
            provider: 'ollama-gemma',
            data: result
        });
    } catch (err) {
        console.warn('[IntakeController] Local Ollama Tier 2 failed:', err.message);
        errors.ollama = err.message;
    }

    // Tier 3: Google Gemini API (gemini-3.6-flash)
    if (process.env.GEMINI_API_KEY) {
        try {
            const fallbackResult = await analyzeWithGemini(patient, transcript);
            console.log('[IntakeController] Google Gemini API analysis complete');
            return res.json({
                success: true,
                model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
                provider: 'google-gemini',
                data: fallbackResult
            });
        } catch (err) {
            console.warn('[IntakeController] Google Gemini Tier 3 failed:', err.message);
            errors.gemini = err.message;
        }
    } else {
        console.log('[IntakeController] Skipping Gemini Tier 3 (GEMINI_API_KEY not set)');
    }

    // All tiers exhausted
    console.error('[IntakeController] All AI intake providers failed:', errors);
    return res.status(503).json({
        success: false,
        error: 'All AI intake engines (Groq Gemma, Ollama, and Gemini) are currently unavailable.',
        details: errors
    });
}

