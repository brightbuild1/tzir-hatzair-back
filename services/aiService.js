const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are an expert academic advisor for 'Tzir HaTzair'.
Your goal is to provide a semantic match score (0-100) and a short Hebrew explanation (1 sentence only)
for why each scholarship fits the candidate's specific background.
Focus specifically on the candidate's studyField, sectors, and militaryType.
Compare the candidate's militaryType against each scholarship's military requirement,
the candidate's studyField against the scholarship's field,
and the candidate's sectors against the scholarship's sector.
Always respond in Hebrew.`;

const FALLBACK_EXPLANATION = 'מתאים לפי קריטריונים יבשים';

function extractJSON(text) {
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) return jsonBlockMatch[1].trim();

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return arrayMatch[0].trim();

    return text.trim();
}

function buildLeanCandidate(candidate) {
    const { name, studyField, sectors, militaryType, periphery, residenceArea } = candidate;
    return { name, studyField, sectors, militaryType, periphery, residenceArea };
}

async function analyzeMatch(candidate, scholarships) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
        });

        const leanCandidate = buildLeanCandidate(candidate);

        const prompt = `
Given the following candidate:
${JSON.stringify(leanCandidate, null, 2)}

And the following scholarships:
${JSON.stringify(scholarships, null, 2)}

Return ONLY a valid JSON array with no extra text, in this exact format:
[{ "id": "string", "aiScore": number, "explanation": "string in Hebrew, 1 sentence" }]

One object per scholarship, in the same order.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        const cleaned = extractJSON(text);
        const parsed = JSON.parse(cleaned);

        console.log('AI Response received successfully');
        return { success: true, data: parsed };
    } catch (error) {
        console.error('AI Service Error:', error.message);
        const fallback = scholarships.map(s => ({
            id: s.id,
            aiScore: s.score ?? 0,
            explanation: FALLBACK_EXPLANATION,
        }));
        return { success: false, data: fallback };
    }
}

module.exports = { analyzeMatch };
