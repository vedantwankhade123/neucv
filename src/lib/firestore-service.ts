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
    Timestamp
} from 'firebase/firestore';
import { ResumeData } from '@/types/resume';

const RESUMES_COLLECTION = 'resumes';

// Create or Update a resume
export const saveResumeToFirestore = async (userId: string, resumeData: ResumeData) => {
    try {
        // Ensure the resume belongs to the user
        const dataWithUser = {
            ...resumeData,
            userId,
            lastModified: Date.now() // Update timestamp
        };

        const resumeRef = doc(db, RESUMES_COLLECTION, resumeData.id);
        await setDoc(resumeRef, dataWithUser);
        return dataWithUser;
    } catch (error) {
        console.error('Error saving resume to Firestore:', error);
        throw error;
    }
};

// Get all resumes for a specific user
export const getUserResumesFromFirestore = async (userId: string): Promise<ResumeData[]> => {
    try {
        const q = query(
            collection(db, RESUMES_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const resumes: ResumeData[] = [];

        querySnapshot.forEach((doc) => {
            resumes.push(doc.data() as ResumeData);
        });

        return resumes.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
        console.error('Error fetching user resumes:', error);
        throw error;
    }
};

// Get a single resume
export const getResumeFromFirestore = async (userId: string, resumeId: string): Promise<ResumeData | null> => {
    try {
        const resumeRef = doc(db, RESUMES_COLLECTION, resumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (resumeSnap.exists()) {
            const data = resumeSnap.data() as ResumeData;
            // Security check: Ensure the resume belongs to the requesting user
            if (data.userId === userId) {
                return data;
            } else {
                console.error('Unauthorized access attempt to resume');
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching resume:', error);
        throw error;
    }
};

// Delete a resume
export const deleteResumeFromFirestore = async (userId: string, resumeId: string) => {
    try {
        // First verify ownership
        const resume = await getResumeFromFirestore(userId, resumeId);
        if (resume) {
            await deleteDoc(doc(db, RESUMES_COLLECTION, resumeId));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting resume:', error);
        throw error;
    }
};
