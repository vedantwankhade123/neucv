import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { CoverLetterData } from '@/types/coverletter';

const COVER_LETTERS_COLLECTION = 'cover-letters';

// Create or Update a cover letter
export const saveCoverLetterToFirestore = async (userId: string, coverLetterData: CoverLetterData) => {
    try {
        // Ensure the cover letter belongs to the user
        const dataWithUser = {
            ...coverLetterData,
            userId,
            lastModified: Date.now() // Update timestamp
        };

        const coverLetterRef = doc(db, COVER_LETTERS_COLLECTION, coverLetterData.id);
        await setDoc(coverLetterRef, dataWithUser);
        return dataWithUser;
    } catch (error) {
        console.error('Error saving cover letter to Firestore:', error);
        throw error;
    }
};

// Get all cover letters for a specific user
export const getUserCoverLettersFromFirestore = async (userId: string): Promise<CoverLetterData[]> => {
    try {
        const q = query(
            collection(db, COVER_LETTERS_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const coverLetters: CoverLetterData[] = [];

        querySnapshot.forEach((doc) => {
            coverLetters.push(doc.data() as CoverLetterData);
        });

        return coverLetters.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
        console.error('Error fetching user cover letters:', error);
        throw error;
    }
};

// Get a single cover letter
export const getCoverLetterFromFirestore = async (userId: string, coverLetterId: string): Promise<CoverLetterData | null> => {
    try {
        const coverLetterRef = doc(db, COVER_LETTERS_COLLECTION, coverLetterId);
        const coverLetterSnap = await getDoc(coverLetterRef);

        if (coverLetterSnap.exists()) {
            const data = coverLetterSnap.data() as CoverLetterData;
            // Security check: Ensure the cover letter belongs to the requesting user
            if (data.userId === userId) {
                return data;
            } else {
                console.error('Unauthorized access attempt to cover letter');
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching cover letter:', error);
        throw error;
    }
};

// Delete a cover letter
export const deleteCoverLetterFromFirestore = async (userId: string, coverLetterId: string) => {
    try {
        // First verify ownership
        const coverLetter = await getCoverLetterFromFirestore(userId, coverLetterId);
        if (coverLetter) {
            await deleteDoc(doc(db, COVER_LETTERS_COLLECTION, coverLetterId));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting cover letter:', error);
        throw error;
    }
};
