import * as pdfjsLib from 'pdfjs-dist';
import { InterviewData, InterviewResponse } from '@/types/interview';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { createWorker } from 'tesseract.js';

// Configure PDF.js worker using a reliable CDN
if (typeof window !== 'undefined') {
    // Use specific version matching package.json to avoid version mismatch errors
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
}

/**
 * Render a PDF page to an image URL for OCR
 */
async function pdfPageToImage(page: any): Promise<string> {
    const viewport = page.getViewport({ scale: 1.5 }); // Reasonable scale for OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error('Canvas context not available');

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return canvas.toDataURL('image/png');
}

/**
 * Parse resume PDF and extract text content
 * Includes fallback to OCR for scanned PDFs
 */
export async function parseResumePDF(file: File): Promise<string> {
    try {
        console.log('Starting PDF extraction for file:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        let isScanned = true;

        // Try standard text extraction first
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) { // Limit to first 3 pages
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Check if page has actual text items
            if (textContent.items.length > 0) {
                isScanned = false;
            }

            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            
            if (pageText.trim().length > 0) {
                fullText += pageText + '\n';
            }
        }

        // If text is very short or empty, it might be a scanned PDF or image-only PDF
        if (isScanned || fullText.trim().length < 50) {
            console.log('PDF appears to be scanned or image-based. Attempting OCR...');
            
            // Process first page only for efficiency
            const page = await pdf.getPage(1);
            const imageUrl = await pdfPageToImage(page);
            
            const worker = await createWorker('eng');
            const ret = await worker.recognize(imageUrl);
            await worker.terminate();
            
            console.log('OCR Fallback complete, text length:', ret.data.text.length);
            fullText = ret.data.text;
        }

        console.log('Total text extracted:', fullText.length);
        return fullText.trim();
    } catch (error) {
        console.error('PDF parsing error details:', error);
        throw new Error('Failed to parse resume PDF. Please try uploading an image format instead.');
    }
}

/**
 * Parse resume Image and extract text content using OCR
 */
export async function parseResumeImage(file: File): Promise<string> {
    try {
        console.log('Starting Image OCR for file:', file.name);
        
        // Create a URL for the file to ensure Tesseract can read it properly
        const imageUrl = URL.createObjectURL(file);
        
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imageUrl);
        await worker.terminate();
        
        // Clean up
        URL.revokeObjectURL(imageUrl);
        
        console.log('OCR complete, text length:', ret.data.text.length);
        return ret.data.text.trim();
    } catch (error) {
        console.error('Image parsing error details:', error);
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