// ─── Ollama AI Service ─────────────────────────────────────────────────────────
// Uses local Ollama instance (free, no API key needed)
// Make sure Ollama is running: `ollama serve`
// And model is pulled: `ollama pull llama3.2`

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * Call Ollama local API
 */
async function callOllama(prompt, systemPrompt = '') {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
            stream: false,
            options: {
                temperature: 0.1,
                top_p: 0.9,
                num_predict: 1000
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.response;
}

/**
 * Extract prescription details from natural language input
 */
async function extractPrescription(text) {
    const systemPrompt = `You are a pharmacy data extraction AI. 
You extract structured data from pharmacy prescription requests.
Always respond with ONLY a valid JSON object. No explanation, no markdown, no code blocks.`;

    const prompt = `Extract prescription data from this input: "${text}"

STRICT RULES:
- medicine_name: ONLY the drug name + strength. Example: "Amoxicillin 250mg". NEVER include dosage instructions or full sentences.
- dosage: ONLY the single dose amount. Example: "1 pill" or "2 tablets"
- frequency: ONLY how often taken. Example: "3x day" or "twice daily" or "once daily"
- frequency_per_day: a number only. Example: 3
- days: a number only. Example: 7
- quantity: frequency_per_day multiplied by days. Example: 21
- Only include medicines that are explicitly mentioned in the input
- If only 1 medicine is mentioned, return only 1 item in the medicines array
- NEVER add medicines that were not mentioned
- NEVER use example values like "second medicine name"

Return ONLY this JSON format:
{
  "patient_name": "first and last name of patient",
  "medicines": [
    {
      "medicine_name": "Drug Name 250mg",
      "dosage": "1 pill",
      "frequency": "3x day",
      "frequency_per_day": 3,
      "days": 7,
      "quantity": 21
    }
  ]
}`;

    const raw = await callOllama(prompt, systemPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`Could not parse JSON from Ollama response: ${raw}`);

    const parsed = JSON.parse(jsonMatch[0]);

    // Safety filter: remove any medicine entries that look like placeholders
    if (parsed.medicines) {
        parsed.medicines = parsed.medicines.filter(m =>
            m.medicine_name &&
            m.medicine_name !== 'second medicine name with dosage' &&
            m.medicine_name !== 'second medicine name' &&
            m.medicine_name.length > 2 &&
            m.frequency_per_day > 0 &&
            m.days > 0
        );
    }

    return parsed;
}

/**
 * Check Ollama is running and model is available
 */
async function checkOllamaHealth() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        if (!response.ok) return { ok: false, error: 'Ollama not responding' };

        const data = await response.json();
        const models = data.models || [];
        const modelAvailable = models.some(m => m.name.includes(OLLAMA_MODEL.split(':')[0]));

        return {
            ok: true,
            models: models.map(m => m.name),
            modelAvailable,
            activeModel: OLLAMA_MODEL
        };
    } catch (err) {
        return { ok: false, error: `Cannot connect to Ollama at ${OLLAMA_BASE_URL}: ${err.message}` };
    }
}

module.exports = { extractPrescription, checkOllamaHealth, callOllama };