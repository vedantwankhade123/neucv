# Firebase Cloud Functions for Gemini AI

This directory contains the backend code to securely proxy requests to the Gemini API.

## Setup

1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize Functions (if not already): `firebase init functions` (select "Use existing files")
4.  Install dependencies: `cd functions && npm install`

## Configuration

Set your Gemini API Key in the Firebase environment configuration:

```bash
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```

## Deployment

Deploy the functions to Firebase:

```bash
firebase deploy --only functions
```

## Usage in Frontend

To use this function in your frontend, you need to switch from direct API calls to `httpsCallable`.

Example update in `src/lib/gemini.ts`:

```typescript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const generateContentFunction = httpsCallable(functions, 'generateContent');

export const generateContent = async (prompt: string): Promise<string> => {
    const result = await generateContentFunction({ prompt });
    return (result.data as any).text;
};
```
