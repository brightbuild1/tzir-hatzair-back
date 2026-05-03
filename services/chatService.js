const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getScholarships } = require('./firestoreService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache: scholarship data refreshes every 5 minutes
let cachedScholarships = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getScholarshipContext() {
    const now = Date.now();
    if (cachedScholarships && now - cacheTimestamp < CACHE_TTL) {
        return cachedScholarships;
    }

    const scholarships = await getScholarships();
    cachedScholarships = scholarships.map(s => ({
        id: s.id,
        name: s.name,
        field: s.field,
        amount: s.amount,
        sector: s.sector,
        military: s.military,
        description: s.description,
        eligibility: s.eligibility,
        deadline: s.deadline,
    }));
    cacheTimestamp = now;
    return cachedScholarships;
}

function buildSystemPrompt(scholarships) {
    return `
# Role: Professional Scholarship Consultant (Concise Mode)
אתה יועץ מלגות מומחה של מרכז הנוער "ציר הצעיר" בשדרות. 

# Context (RAG):
הסתמך אך ורק על המאגר הבא:
${JSON.stringify(scholarships, null, 2)}

# Operating Instructions:
1. **Strict Brevity:** ענה בתמציתיות רבה. אורך התשובה לא יעלה על 3-4 משפטים.
2. **Token Economy:** הימנע מהקדמות מיותרות ומחזרות על דברי המשתמש. גש ישר לעניין.
3. **Strict Context:** ענה רק לפי המאגר. אם המידע לא קיים, ענה: "אין לי מידע על כך במאגר כרגע". לעולם אל תשתמש בידע חיצוני.
4. **Refusal Policy:** שאלות שלא קשורות למלגות/לימודים? סרב בנימוס בתוך משפט אחד.
5. **Language:** עברית בלבד.

# Response Format:
- פתח בברכה של 2-3 מילים (למשל: "היי, הנה המלגות המתאימות:").
- הצג את המלגות כרשימה תמציתית (שם המלגה + סכום + תנאי סף קריטי אחד).
- סיים בשאלת המשך אחת קצרה אם חסר מידע לסינון.

# Example of a Good Response:
"היי, מצאתי עבורך את מלגת הלוחמים (10,000 ש"ח) ומלגת הפריפריה. שתיהן דורשות שירות צבאי מלא ומגורים באזור. האם למדת בתיכון בשדרות?"

# Constraints:
- אל תמציא תאריכי הגשה. אם לא כתוב במאגר, ציין שמומלץ לבדוק באתר המלגה.
- אם המשתמש נתן מידע חלקי (למשל: "אני סטודנט להנדסה"), שאל אותו שאלות המשך רלוונטיות כדי לדייק את הסינון (למשל: "האם שירתת כלוחם?").
`

}

const MAX_HISTORY = 20;

async function chat(messages) {
    const scholarships = await getScholarshipContext();
    const systemPrompt = buildSystemPrompt(scholarships);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
    });

    const trimmedMessages = messages.slice(-MAX_HISTORY);
    const lastMessage = trimmedMessages.pop();

    // convert history: "assistant" → "model" (Gemini convention)
    const history = trimmedMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(lastMessage.content);
    const text = result.response.text();

    return {
        role: 'assistant',
        content: text,
    };
}

module.exports = { chat };
