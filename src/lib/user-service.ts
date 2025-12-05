import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction, deleteDoc } from 'firebase/firestore';
import { UserProfile, CreditTransaction } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

const USERS_COLLECTION = 'users';

export const getUserProfile = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<UserProfile> => {
    console.log(`[DEBUG] getUserProfile called for uid: ${user.uid}`);
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    console.log(`[DEBUG] Accessing document path: ${userRef.path}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Check for monthly reset
        const lastReset = userData.lastCreditReset || userData.createdAt;
        if (now - lastReset > thirtyDaysMs) {
            console.log(`[DEBUG] Monthly credit reset for user: ${user.uid}`);
            const resetTransaction: CreditTransaction = {
                id: uuidv4(),
                amount: 25 - userData.credits, // Adjustment to reach 25
                type: 'monthly_reset',
                description: 'Monthly free credits reset',
                timestamp: now
            };

            await updateDoc(userRef, {
                credits: 25, // Reset to 25
                lastCreditReset: now,
                lastLogin: now,
                creditHistory: [resetTransaction, ...(userData.creditHistory || [])].slice(0, 50) // Keep last 50
            });
            return {
                ...userData,
                credits: 25,
                lastCreditReset: now,
                lastLogin: now,
                creditHistory: [resetTransaction, ...(userData.creditHistory || [])].slice(0, 50)
            };
        }

        // Update last login
        await updateDoc(userRef, { lastLogin: now });
        return userData;
    } else {
        // Create new profile
        const now = Date.now();
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            plan: 'free',
            credits: 25, // Give 25 free credits to start
            createdAt: now,
            lastLogin: now,
            lastCreditReset: now,
            usePersonalApiKey: false,
            creditHistory: [{
                id: uuidv4(),
                amount: 25,
                type: 'bonus',
                description: 'Welcome bonus credits',
                timestamp: now
            }]
        };
        await setDoc(userRef, newProfile);
        return newProfile;
    }
};

export const deductCredits = async (uid: string, amount: number): Promise<boolean> => {
    console.log(`[DEBUG] deductCredits called for uid: ${uid}, amount: ${amount}`);
    const userRef = doc(db, USERS_COLLECTION, uid);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }

            const userData = userDoc.data() as UserProfile;
            if (userData.credits >= amount) {
                const transactionRecord: CreditTransaction = {
                    id: uuidv4(),
                    amount: -amount,
                    type: 'usage',
                    description: 'Used for AI generation', // You might want to pass description as arg later
                    timestamp: Date.now()
                };

                transaction.update(userRef, {
                    credits: userData.credits - amount,
                    creditHistory: [transactionRecord, ...(userData.creditHistory || [])].slice(0, 50)
                });
            } else {
                throw new Error("Insufficient credits");
            }
        });
        return true;
    } catch (e) {
        console.error("Credit deduction failed: ", e);
        return false;
    }
};

export const addCredits = async (uid: string, amount: number) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const transactionRecord: CreditTransaction = {
            id: uuidv4(),
            amount: amount,
            type: 'purchase',
            description: 'Credits purchased',
            timestamp: Date.now()
        };

        await updateDoc(userRef, {
            credits: increment(amount),
            creditHistory: [transactionRecord, ...(userData.creditHistory || [])].slice(0, 50)
        });
    }
};

export const updateUserPlan = async (uid: string, plan: 'free' | 'pro') => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { plan });
};

export const addTemplateCredits = async (uid: string, amount: number) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
        templateCredits: increment(amount)
    });
};
export const togglePersonalApiKeyPreference = async (uid: string, usePersonal: boolean) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { usePersonalApiKey: usePersonal });
};

export const deleteUserAccount = async (uid: string) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
};
