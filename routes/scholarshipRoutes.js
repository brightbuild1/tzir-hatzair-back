const express = require('express');
const router = express.Router();
const { getScholarships } = require('../services/firestoreService');

// GET /api/scholarships
router.get('/', async (req, res) => {
    try {
        const scholarships = await getScholarships();
        res.status(200).json({ count: scholarships.length, scholarships });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
