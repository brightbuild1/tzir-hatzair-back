const axios = require('axios');
require('dotenv').config();

const sfConfig = {
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    loginUrl: process.env.SF_LOGIN_URL
};

let cachedToken = null;
async function getAccessToken() {
    if (cachedToken) return cachedToken;

    try {
        const params = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: sfConfig.clientId,
            client_secret: sfConfig.clientSecret
        });

        const response = await axios.post(`${sfConfig.loginUrl}/services/oauth2/token`, params);
        cachedToken = response.data.access_token;

        // איפוס הטוקן אחרי שעה
        setTimeout(() => { cachedToken = null; }, 3600000);

        return cachedToken;
    } catch (error) {
        console.error('Auth Error:', error.response?.data || error.message);
        throw error;
    }
}

function getBaseUrl() {
    return `${sfConfig.loginUrl}/services/data/v60.0`;
}

module.exports = { getAccessToken, getBaseUrl };
