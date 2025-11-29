import * as pdfjsLib from 'pdfjs-dist';
import { InterviewData, InterviewResponse } from '@/types/interview';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { createWorker } from 'tesseract.js';

// Configure PDF.js worker for Vite
// Use local worker file from public folder to avoid CORS issues
if (typeof window !== 'undefined') {
    // Use the worker file from public folder (copied from node_modules)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Parse resume PDF and extract text content
 */
export async function parseResumePDF(file: File): Promise<string> {
    try {
        console.log('Starting PDF extraction for file:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF loaded successfully, pages:', pdf.numPages);

        let fullText = '';

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
            console.log(`Page ${i} extracted, length: ${pageText.length}`);
        }

        console.log('Total text extracted, length:', fullText.length);
        return fullText.trim();
    } catch (error) {
        console.error('PDF parsing error details:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to parse resume PDF: ${error.message}`);
        }
        throw new Error('Failed to parse resume PDF. The file may be corrupted or password-protected.');
    }
}

/**
 * Parse resume Image and extract text content using OCR
 */
export async function parseResumeImage(file: File): Promise<string> {
    try {
        console.log('Starting Image OCR for file:', file.name);
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        await worker.terminate();
        
        console.log('OCR complete, text length:', ret.data.text.length);
        return ret.data.text.trim();
    } catch (error) {
        console.error('Image parsing error details:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to parse resume image: ${error.message}`);
        }
        throw new Error('Failed to parse resume image.');
    }
}

/**
 * Save interview session to Firestore
 */
export async function saveInterviewSession(interviewData: InterviewData): Promise<string> {
    try {
        // Remove File object before saving (can't serialize)
        const dataToSave = {
            ...interviewData,
            setupData: {
                ...interviewData.setupData,
                resumeFile: undefined // Don't save the file object
            }
        };

        const docRef = await addDoc(collection(db, 'interviews'), dataToSave);
        return docRef.id;
    } catch (error) {
        console.error('Error saving interview session:', error);
        throw new Error('Failed to save interview session');
    }
}

/**
 * Get interview history for a user
 */
export async function getInterviewHistory(userId: string, limitCount: number = 10) {
    try {
        const q = query(
            collection(db, 'interviews'),
            where('userId', '==', userId),
            where('status', '==', 'completed'),
            orderBy('endTime', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching interview history:', error);
        return [];
    }
}

/**
 * Calculate overall performance score from responses
 */
export function calculatePerformanceScore(responses: InterviewResponse[]): number {
    if (responses.length === 0) return 0;

    const evaluatedResponses = responses.filter(r => r.evaluation);
    if (evaluatedResponses.length === 0) return 0;

    const totalScore = evaluatedResponses.reduce((sum, r) => {
        return sum + (r.evaluation?.score || 0);
    }, 0);

    return Math.round(totalScore / evaluatedResponses.length);
}

/**
 * Validate resume file
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Please upload a PDF, JPEG, or PNG file' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 10MB' };
    }

    return { valid: true };
}

/**
 * Format duration in minutes and seconds
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: string): string {
    const languageMap: Record<string, string> = {
        'english': 'English',
        'hinglish': 'Hinglish (Hindi + English)',
        'marathi': 'मराठी (Marathi)',
        'hindi': 'हिंदी (Hindi)'
    };
    return languageMap[language] || language;
}