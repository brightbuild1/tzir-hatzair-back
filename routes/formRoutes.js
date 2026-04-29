const express = require('express');
const router = express.Router();
const { fetchFormResponses, fetchParsedCandidates } = require('../services/googleFormsService');

// GET /api/forms/responses — parsed clean data
router.get('/responses', async (req, res) => {
    try {
        const soldiers = await fetchParsedCandidates();
        res.status(200).json({ count: soldiers.length, soldiers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/candidates — parsed clean JSON
router.get('/candidates', async (req, res) => {
    try {
        const candidates = await fetchParsedCandidates();
        res.status(200).json({ count: candidates.length, candidates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
