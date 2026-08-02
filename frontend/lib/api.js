// CliniQ AI — Backend API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL !== undefined 
    ? process.env.NEXT_PUBLIC_API_URL 
    : (typeof window !== 'undefined' ? '' : 'http://localhost:3001');

/**
 * Send patient intake data to backend for AI analysis
 * @param {Object} patient - { name, age, gender, language }
 * @param {string} transcript - Patient's symptom description
 * @returns {Promise<Object>} Structured clinical JSON from AI
 */
export async function analyzeIntake(patient, transcript) {
    const response = await fetch(`${API_BASE}/api/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, transcript }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `API Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
    }

    return result.data;
}

/**
 * Check if the backend API is available
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}
