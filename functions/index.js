const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

admin.initializeApp();

// Access API key from environment variables
// Set this using: firebase functions:config:set gemini.key="YOUR_API_KEY"
// Or use process.env.GEMINI_API_KEY if using dotenv
const API_KEY = functions.config().gemini ? functions.config().gemini.key : process.env.GEMINI_API_KEY;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

exports.generateContent = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    if (!genAI) {
        throw new functions.https.HttpsError('failed-precondition', 'Gemini API Key is not configured.');
    }

    const prompt = data.prompt;
    if (!prompt) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with one argument "prompt".');
    }

    // Optional: Check user credits here before generating to prevent abuse
    // const uid = context.auth.uid;
    // const userRef = admin.firestore().collection('users').doc(uid);
    // const userDoc = await userRef.get();
    // if (userDoc.data().credits <= 0) {
    //   throw new functions.https.HttpsError('resource-exhausted', 'Insufficient credits.');
    // }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { text };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate content.');
    }
});
