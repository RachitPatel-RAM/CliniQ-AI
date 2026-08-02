// CliniQ AI — Intake Controller
import { analyzeIntake } from '../services/gemmaService.js';
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

    try {
        // Primary: Gemma via Ollama
        const result = await analyzeIntake(patient, transcript);
        console.log('[IntakeController] Gemma analysis complete');

        return res.json({
            success: true,
            model: 'gemma3:4b',
            provider: 'ollama',
            data: result
        });
    } catch (primaryError) {
        console.warn('[IntakeController] Primary (Gemma) failed:', primaryError.message);

        try {
            // Fallback: Gemini API
            const fallbackResult = await analyzeWithGemini(patient, transcript);
            return res.json({
                success: true,
                model: 'gemini-1.5-flash',
                provider: 'gemini',
                data: fallbackResult
            });
        } catch (fallbackError) {
            console.error('[IntakeController] Both AI providers failed');
            return res.status(503).json({
                success: false,
                error: 'AI analysis unavailable. Please ensure Ollama is running with gemma3:4b model.',
                details: primaryError.message
            });
        }
    }
}
