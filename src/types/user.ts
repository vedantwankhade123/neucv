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
    lastCreditReset?: number; // Timestamp of last monthly credit reset
    usePersonalApiKey?: boolean; // Preference to always use personal key
    creditHistory?: CreditTransaction[];
}

export interface CreditTransaction {
    id: string;
    amount: number; // Positive for addition, negative for deduction
    type: 'usage' | 'purchase' | 'monthly_reset' | 'bonus' | 'manual_adjustment';
    description: string;
    timestamp: number;
}
