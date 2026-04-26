const express = require('express');
const router = express.Router();
const { analyzeMatch } = require('../services/aiService');

// POST /api/match/ai-enrich
router.post('/ai-enrich', async (req, res) => {
    const { candidate, scholarships } = req.body;
console.log('ai',req.body)
    if (!candidate || !Array.isArray(scholarships) || scholarships.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: candidate, scholarships (array).' });
    }

    // לוג בסיסי למניעת שימוש לרעה ב-API
    console.log(`[AI Match] Request from IP: ${req.ip} | Candidate: ${candidate.email ?? 'unknown'} | Scholarships: ${scholarships.length}`);

    const top5 = scholarships.slice(0, 5);
    const { success, data } = await analyzeMatch(candidate, top5);

    return res.status(200).json({
        aiEnriched: success,
        results: data,
    });
});

module.exports = router;
