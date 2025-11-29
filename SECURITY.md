# Security Guide for AI Features

## Securing Your Gemini API Key

Currently, for development ease, the API key is stored in the `.env` file and accessed directly by the frontend. **This is not secure for production** as your API key can be exposed to users.

### Recommended Production Setup

1.  **Use the Backend Proxy**: We have created a Firebase Cloud Function in the `functions/` directory.
    *   Deploy this function to Firebase.
    *   Store your API key in Firebase environment variables (not in code).
    *   Update the frontend to call this function instead of the Gemini API directly.

2.  **Steps to Deploy Proxy**:
    *   Navigate to `functions/` directory.
    *   Run `npm install`.
    *   Run `firebase login` and `firebase init functions`.
    *   Set your key: `firebase functions:config:set gemini.key="YOUR_KEY"`.
    *   Deploy: `firebase deploy --only functions`.

3.  **Update Frontend**:
    *   Modify `src/lib/gemini.ts` to use `httpsCallable` from Firebase SDK to call the `generateContent` function.

## Free Tier Usage

*   **Gemini API**: Google offers a free tier for the Gemini API. You can use this for personal projects.
*   **Firebase**: Firebase also offers a generous free tier (Spark Plan) which supports Firestore and Authentication. Note that Cloud Functions (for the proxy) might require the Blaze (Pay-as-you-go) plan, but it includes a free tier usage limit.

## Credit System

*   The application includes a credit system to track usage.
*   Users get 5 free credits initially.
*   You can adjust these limits in `src/lib/user-service.ts`.
