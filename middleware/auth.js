function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (req.path.startsWith('/api/auth/generate-link') || req.path.startsWith('/api/auth/callback')) {
        return next();
    }
    if (!apiKey || apiKey !== process.env.AUTH_API_KEY) {
        return res.status(401).json({ error: 'api missing' });
    }

    next();
}

module.exports = { apiKeyAuth };
