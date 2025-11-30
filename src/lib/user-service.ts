import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

const USERS_COLLECTION = 'users';

export const getUserProfile = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<UserProfile> => {
    console.log(`[DEBUG] getUserProfile called for uid: ${user.uid}`);
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    console.log(`[DEBUG] Accessing document path: ${userRef.path}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // Update last login
        await updateDoc(userRef, { lastLogin: Date.now() });
        return userSnap.data() as UserProfile;
    } else {
        // Create new profile
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            plan: 'free',
            credits: 25, // Give 25 free credits to start
            createdAt: Date.now(),
            lastLogin: Date.now()
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
                transaction.update(userRef, { credits: userData.credits - amount });
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
    await updateDoc(userRef, {
        credits: increment(amount)
    });
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
