export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    plan: 'free' | 'pro' | 'premium';
    credits: number; // For AI generation
    templateCredits?: number; // Number of single templates they can unlock
    unlockedTemplates?: string[]; // IDs of unlocked templates
    createdAt: number;
    lastLogin: number;
}
