const express = require('express');
const router = express.Router();
const { processSoldiersList } = require('./services/soldierService');

router.post('/soldiers', async (req, res) => {
    const soldiers = req.body;

    if (!Array.isArray(soldiers) || soldiers.length === 0) {
        return res.status(400).json({ error: 'Body must be a non-empty array of soldiers.' });
    }

    const { results, errors } = await processSoldiersList(soldiers);

    const status = errors.length === 0 ? 200 : results.length === 0 ? 500 : 207;
    res.status(status).json({ results, errors });
});

module.exports = router;
