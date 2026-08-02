import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are CliniQ AI.

You are a multilingual clinical intake assistant.
You understand Gujarati, Hindi, English, and mixed-language conversations.

Your ONLY responsibility is to extract structured clinical intake information from the patient's description.

You MUST NEVER:
- Diagnose any disease
- Recommend any medicines or dosage
- Recommend any treatment
- Predict any disease or survival outcome

If symptoms indicate a potential emergency such as:
- Chest pain or tightness
- Difficulty breathing or shortness of breath
- Heavy or uncontrolled bleeding
- Loss of consciousness or fainting
- Seizures or convulsions
- Severe allergic reaction (swelling, hives, throat closing)
- Sudden severe headache
- Signs of stroke (face drooping, arm weakness, speech difficulty)

Then set emergency.flag to true and list the reasons.

Do NOT diagnose. Only flag for professional attention.

Return ONLY valid JSON. No markdown. No explanation. No code blocks. No extra text.

Required JSON schema:
{
  "chief_complaint": "Clear 1-sentence summary of the main medical concern in English",
  "symptoms": ["symptom 1 with severity/location", "symptom 2"],
  "duration": "Concise duration phrase (e.g., '2 days', 'Recent post-walking', 'Unspecified')",
  "current_medications": ["Any medications taken"],
  "existing_conditions": ["Any pre-existing conditions"],
  "allergies": ["Any allergies"],
  "missing_information": ["Important clinical details not provided"],
  "emergency": {
    "flag": false,
    "reasons": []
  },
  "doctor_summary": "Ultra-concise 2-sentence clinical summary for 3-second doctor scanning: Patient profile & main presentation | Key symptoms, medications taken & immediate assessment needed."
}`;

function buildPrompt(patient, transcript) {
    return `${SYSTEM_PROMPT}

Patient Information:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Preferred Language: ${patient.language}

Patient Narrative (in ${patient.language}):
"${transcript}"

Extract the clinical intake information and return ONLY valid JSON.`;
}

function parseJson(raw) {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found');
    return JSON.parse(match[0]);
}

async function tryGroq(patient, transcript) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY missing');

    const model = process.env.GROQ_MODEL || 'gemma2-9b-it';
    const prompt = buildPrompt(patient, transcript);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Groq HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return parseJson(data.choices[0].message.content);
}

async function tryOllama(patient, transcript) {
    const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
    const model = process.env.OLLAMA_MODEL || 'gemma3:4b';
    const prompt = buildPrompt(patient, transcript);

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            stream: false,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return parseJson(data.message.content);
}

async function tryGemini(patient, transcript) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY missing');

    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const prompt = buildPrompt(patient, transcript);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: 'application/json' }
        })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseJson(text);
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { patient, transcript } = body;

        if (!patient || !transcript) {
            return NextResponse.json({ error: 'Missing patient or transcript' }, { status: 400 });
        }

        // Tier 1: Groq Cloud API
        try {
            const data = await tryGroq(patient, transcript);
            return NextResponse.json({ success: true, provider: 'groq-gemma', model: 'gemma2-9b-it', data });
        } catch (e) {
            console.warn('[Vercel API] Groq Tier 1 failed:', e.message);
        }

        // Tier 2: Ollama (Local)
        try {
            const data = await tryOllama(patient, transcript);
            return NextResponse.json({ success: true, provider: 'ollama-gemma', model: 'gemma3:4b', data });
        } catch (e) {
            console.warn('[Vercel API] Ollama Tier 2 failed:', e.message);
        }

        // Tier 3: Google Gemini API
        try {
            const data = await tryGemini(patient, transcript);
            return NextResponse.json({ success: true, provider: 'google-gemini', model: 'gemini-3.6-flash', data });
        } catch (e) {
            console.warn('[Vercel API] Gemini Tier 3 failed:', e.message);
            return NextResponse.json({ error: 'All AI tiers failed: ' + e.message }, { status: 500 });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
