const axios = require('axios');
const { getAccessToken, getBaseUrl } = require('./salesforceService');

async function upsertSoldier(soldierData) {
    try {
        const token = await getAccessToken();
        const baseUrl = getBaseUrl();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // שלב 1: חיפוש קונטקט קיים לפי אימייל
        const email = soldierData.email;
        const query = `SELECT Id FROM Contact WHERE Email = '${email}' LIMIT 1`;
        const searchResponse = await axios.get(
            `${baseUrl}/query?q=${encodeURIComponent(query)}`,
            { headers }
        );

        // פיצול fullName ל-FirstName ו-LastName
        const nameParts = (soldierData.fullName || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

        const contactBody = {
            FirstName: firstName,
            LastName: lastName,
            Email: soldierData.email,
            Phone: soldierData.phoneNumber,
            Education_Status__c: soldierData.educationStatus,
            School_History__c: soldierData.schoolHistory,
            Study_Preferences__c: soldierData.studyPreferences,
            Diagnosis_And_Attention__c: soldierData.diagnosisAndAttention,
            Work_Experience__c: soldierData.workExperience,
            Military_Service__c: soldierData.militaryService,
            Strengths_And_Skills__c: soldierData.strengthsAndSkills,
            Consultation_Goal__c: soldierData.consultationGoal,
            Additional_Info__c: soldierData.additionalInfo,
            Status__c: soldierData.status,
            Notes__c: soldierData.notes,
        };

        const records = searchResponse.data.records;

        if (records.length > 0) {
            // שלב 2a: עדכון רשומה קיימת
            const existingId = records[0].Id;
            await axios.patch(
                `${baseUrl}/sobjects/Contact/${existingId}`,
                contactBody,
                { headers }
            );
            console.log('Updated existing soldier record. ID:', existingId);
            return { id: existingId, updated: true };
        } else {
            // שלב 2b: יצירת רשומה חדשה
            const createResponse = await axios.post(
                `${baseUrl}/sobjects/Contact`,
                contactBody,
                { headers }
            );
            console.log('Created new soldier record. ID:', createResponse.data.id);
            return { id: createResponse.data.id, created: true };
        }
    } catch (error) {
        console.error('Error in Upsert:', error.response?.data || error.message);
        throw error;
    }
}

async function processSoldiersList(soldiers) {
    const results = [];
    const errors = [];
    let created = 0;
    let updated = 0;

    for (const soldier of soldiers) {
        if (!soldier.email || !soldier.fullName) {
            errors.push({ soldier, error: 'Missing required fields: email, fullName' });
            continue;
        }

        try {
            const result = await upsertSoldier(soldier);
            if (result.created) created++;
            if (result.updated) updated++;
            results.push({ soldier: soldier.email, ...result });
        } catch (err) {
            errors.push({
                soldier: soldier.email,
                error: err.response?.data || err.message
            });
        }
    }

    return { results, errors, summary: { created, updated, failed: errors.length } };
}

module.exports = { upsertSoldier, processSoldiersList };
