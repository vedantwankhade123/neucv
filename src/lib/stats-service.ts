import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const STATS_DOC_ID = 'global';
const STATS_COLLECTION = 'stats';

export interface GlobalStats {
    totalUsers: number;
    totalResumes: number;
    totalDownloads: number;
}

export const getGlobalStats = async (): Promise<GlobalStats> => {
    try {
        const statsRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
            return statsSnap.data() as GlobalStats;
        } else {
            // Initialize with REAL zeros - no dummy data
            const initialStats: GlobalStats = {
                totalUsers: 0,
                totalResumes: 0,
                totalDownloads: 0
            };
            await setDoc(statsRef, initialStats);
            return initialStats;
        }
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return { totalUsers: 0, totalResumes: 0, totalDownloads: 0 };
    }
};

export const incrementUserCount = async () => {
    try {
        const statsRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
        await updateDoc(statsRef, {
            totalUsers: increment(1)
        });
    } catch (error) {
        // If doc doesn't exist, getGlobalStats will create it next time, or we can try set here.
        // For simplicity, ignore error or try set.
        console.error("Error incrementing user count:", error);
    }
};

export const incrementResumeCount = async () => {
    try {
        const statsRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
        await updateDoc(statsRef, {
            totalResumes: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing resume count:", error);
    }
};

export const incrementDownloadCount = async () => {
    try {
        const statsRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
        await updateDoc(statsRef, {
            totalDownloads: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing download count:", error);
    }
};
