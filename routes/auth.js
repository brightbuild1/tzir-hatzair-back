const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
require('dotenv').config();
// הגדרת הלקוח של גוגל
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/callback' // חייב להיות זהה ב-100% למה שהגדרת בגוגל קלאוד
);
// אנדפוינט 1: יצירת הלינק (אותו תשלח לעובדת)
router.get('/generate-link', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // קריטי! זה מה שמבקש את ה-Refresh Token
    prompt: 'consent',      // מכריח את גוגל לשאול אותה שוב, כדי להבטיח קבלת טוקן
    scope: ['https://www.googleapis.com/auth/forms.responses.readonly'] // הרשאת הקריאה לטפסים
  });
  
  res.send(`
    <h3>שלח את הלינק הזה לעובדת:</h3>
    <a href="${url}" target="_blank">${url}</a>
  `);
});

// אנדפוינט 2: הראוט שלוכד את הקוד מגוגל
router.get('/callback', async (req, res) => {
  const code = req.query.code; // גוגל שולחת את הקוד ב-URL
  
  if (!code) {
    return res.status(400).send('חסר קוד אימות');
  }

  try {
    // ממירים את הקוד הזמני לטוקנים אמיתיים
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('🎉 הנה ה-Refresh Token שלך:');
    console.log(tokens.refresh_token); // זה היהלום שחיפשנו!

    res.send('האימות הושלם בהצלחה! אפשר לסגור את החלון. ה-Refresh Token הודפס בטרמינל.');
  } catch (error) {
    console.error('שגיאה בהמרת הקוד:', error);
    res.status(500).send('שגיאה בתהליך האימות');
  }
});

module.exports = router;