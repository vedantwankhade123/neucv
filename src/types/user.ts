export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    plan: 'free' | 'pro' | 'premium';
    createdAt: number;
    lastLogin: number;
    usePersonalApiKey?: boolean; // Preference to always use personal key
}


