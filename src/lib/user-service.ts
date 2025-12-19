import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

const USERS_COLLECTION = 'users';

export const getUserProfile = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<UserProfile> => {
    console.log(`[DEBUG] getUserProfile called for uid: ${user.uid}`);
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        // Update last login
        await updateDoc(userRef, { lastLogin: Date.now() });
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
            createdAt: now,
            lastLogin: now,
        };
        await setDoc(userRef, newProfile);
        return newProfile;
    }
};



export const deleteUserAccount = async (uid: string) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
};
