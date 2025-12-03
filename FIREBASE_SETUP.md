# Fixing Firebase Permissions Error

The error `FirebaseError: Missing or insufficient permissions` occurs because your live Firebase database has security rules that block the application from reading or writing data.

Even though you have a `firestore.rules` file in your project, these rules are **not automatically synced** to the live database. You must deploy them manually.

## Option 1: Update via Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`project-neu-1e8f9`).
3. Navigate to **Firestore Database** in the left sidebar.
4. Click on the **Rules** tab.
5. Copy the code below and paste it into the rules editor, replacing everything there.
6. Click **Publish**.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if the user is accessing their own data
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Rules for the 'resumes' collection
    match /resumes/{resumeId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if isOwner(resource.data.userId);
    }

    // Rules for the 'cover-letters' collection
    match /cover-letters/{coverLetterId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if isOwner(resource.data.userId);
    }
    
    // Allow the verification test collection
    match /verification_test/{docId} {
      allow read, write: if true;
    }

    // Rules for 'users' collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Stats collection
    match /stats/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Option 2: Deploy via CLI

If you have the Firebase CLI installed and are logged in:

1. Open your terminal in the project directory.
2. Run:
   ```bash
   npx firebase login
   npx firebase deploy --only firestore:rules
   ```
