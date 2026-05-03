const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function getScholarships() {
    const snapshot = await db.collection('scholarships').get();
    const scholarships = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
    return scholarships;
}

module.exports = { db, getScholarships };
