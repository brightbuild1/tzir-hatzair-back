const { google } = require('googleapis');
require('dotenv').config();

const FORM_ID = process.env.GOOGLE_FORM_ID || '1R-yn96z9ZzGKz1a5KyiXZhm3XY0w33rd_Q-nlYL_geY';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const forms = google.forms({ version: 'v1', auth: oauth2Client });

const QUESTION_MAP = {
    '210db9d4': 'fullName',
    '6f044dba': 'phone',
    '30c59002': 'educationStatus',
    '2d1dced9': 'selfDescription',
    '5ace0202': 'subjects',
    '6456cacf': 'learningDisabilities',
    '05f69d7a': 'workExperience',
    '18128522': 'militaryService',
    '54fbec44': 'strengths',
    '0174d0af': 'purpose',
    '7bbda6cc': 'additionalInfo',
};

const mapGoogleToSoldier = (googleResponse) => {
    const answers = googleResponse.answers || {};
    return {
        id: googleResponse.responseId,
        email: googleResponse.respondentEmail || '',
        fullName: answers['210db9d4']?.textAnswers?.answers[0]?.value || '',
        phoneNumber: answers['6f044dba']?.textAnswers?.answers[0]?.value || '',
        educationStatus: answers['30c59002']?.textAnswers?.answers[0]?.value || '',
        schoolHistory: answers['2d1dced9']?.textAnswers?.answers[0]?.value || '',
        studyPreferences: answers['5ace0202']?.textAnswers?.answers[0]?.value || '',
        diagnosisAndAttention: answers['6456cacf']?.textAnswers?.answers[0]?.value || '',
        workExperience: answers['05f69d7a']?.textAnswers?.answers[0]?.value || '',
        militaryService: answers['18128522']?.textAnswers?.answers[0]?.value || '',
        strengthsAndSkills: answers['54fbec44']?.textAnswers?.answers[0]?.value || '',
        consultationGoal: answers['0174d0af']?.textAnswers?.answers[0]?.value || '',
        additionalInfo: answers['7bbda6cc']?.textAnswers?.answers[0]?.value || '',
        submittedAt: new Date(googleResponse.createTime),
        status: 'pending',
        notes: '',
    };
};

async function fetchFormResponses() {
    try {
        let allResponses = [];
        let pageToken = undefined;

        do {
            const res = await forms.forms.responses.list({
                formId: FORM_ID,
                pageToken,
            });
            const responses = res.data.responses || [];
            allResponses = allResponses.concat(responses);
            pageToken = res.data.nextPageToken;
        } while (pageToken);

        console.log(`Fetched ${allResponses.length} form responses (all pages)`);
        return allResponses;
    } catch (error) {
        console.error('Google Forms Error:', error.response?.data || error.message);
        throw error;
    }
}

async function fetchParsedCandidates() {
    const rawResponses = await fetchFormResponses();
    return rawResponses.map(mapGoogleToSoldier);
}

module.exports = { fetchFormResponses, fetchParsedCandidates };
