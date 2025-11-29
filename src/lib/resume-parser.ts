import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { ResumeData, Experience, Education, LayoutItem } from '@/types/resume';
import { initialResumeStyle } from '@/data/initialData';

// Configure PDF.js worker for Vite
// Use local worker file from public folder to avoid CORS issues
if (typeof window !== 'undefined') {
    // Use the worker file from public folder (copied from node_modules)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface ParsedData {
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        address: string;
        linkedin: string;
        github: string;
    };
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        console.log('Starting PDF extraction for file:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF loaded successfully, pages:', pdf.numPages);

        let fullText = '';

        // Extract text from each page
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
        return fullText;
    } catch (error) {
        console.error('PDF extraction error details:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
        throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
    }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from DOCX');
    }
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const match = text.match(emailRegex);
    return match ? match[0] : '';
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const match = text.match(phoneRegex);
    return match ? match[0] : '';
}

/**
 * Extract LinkedIn URL from text
 */
function extractLinkedIn(text: string): string {
    const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?/gi;
    const match = text.match(linkedinRegex);
    return match ? match[0].replace('http://', '').replace('https://', '') : '';
}

/**
 * Extract GitHub URL from text
 */
function extractGitHub(text: string): string {
    const githubRegex = /(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi;
    const match = text.match(githubRegex);
    return match ? match[0].replace('http://', '').replace('https://', '') : '';
}

/**
 * Extract name from text (usually first line or first prominent text)
 */
function extractName(text: string): string {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    // Try to find name in first few lines
    for (const line of lines.slice(0, 3)) {
        const trimmed = line.trim();
        // Name is usually 2-4 words, doesn't contain @ or http
        if (trimmed.length < 50 && !trimmed.includes('@') && !trimmed.includes('http') &&
            /^[a-zA-Z\s.'-]+$/.test(trimmed) && trimmed.split(' ').length >= 2 &&
            trimmed.split(' ').length <= 4) {
            return trimmed;
        }
    }

    return '';
}

/**
 * Parse experience section
 */
function parseExperience(text: string): Experience[] {
    const experiences: Experience[] = [];
    const sections = text.split(/(?:^|\n)(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)/i);

    if (sections.length < 2) return experiences;

    const experienceText = sections[1].split(/(?:^|\n)(?:EDUCATION|SKILLS|CERTIFICATIONS)/i)[0];

    // Try to find job entries (company, role, dates)
    const jobBlocks = experienceText.split(/\n\s*\n/);

    jobBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').filter(l => l.trim());
        if (lines.length === 0) return;

        // Extract dates
        const dateRegex = /(\d{4}|\w+\s+\d{4})[\s-–]+(\d{4}|\w+\s+\d{4}|Present|Current)/i;
        const dateMatch = block.match(dateRegex);

        let company = '';
        let role = '';
        let description = '';
        let startDate = '';
        let endDate = '';

        if (dateMatch) {
            startDate = dateMatch[1];
            endDate = dateMatch[2];
        }

        // First line is usually company or role
        if (lines[0]) {
            // Check if it looks more like a role or company
            if (lines[0].toLowerCase().includes('engineer') || lines[0].toLowerCase().includes('developer') ||
                lines[0].toLowerCase().includes('manager') || lines[0].toLowerCase().includes('designer') ||
                lines[0].toLowerCase().includes('analyst')) {
                role = lines[0].trim();
                company = lines[1] ? lines[1].trim() : '';
            } else {
                company = lines[0].trim();
                role = lines[1] ? lines[1].trim() : '';
            }
        }

        // Rest is description
        description = lines.slice(2).join('\n').trim();

        if (company || role) {
            experiences.push({
                id: `exp-${Date.now()}-${index}`,
                company,
                role,
                startDate,
                endDate,
                description
            });
        }
    });

    return experiences;
}

/**
 * Parse education section
 */
function parseEducation(text: string): Education[] {
    const education: Education[] = [];
    const sections = text.split(/(?:^|\n)(?:EDUCATION|ACADEMIC BACKGROUND)/i);

    if (sections.length < 2) return education;

    const educationText = sections[1].split(/(?:^|\n)(?:EXPERIENCE|SKILLS|CERTIFICATIONS)/i)[0];
    const eduBlocks = educationText.split(/\n\s*\n/);

    eduBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').filter(l => l.trim());
        if (lines.length === 0) return;

        const dateRegex = /(\d{4})[\s-–]+(\d{4}|Present|Current)/i;
        const dateMatch = block.match(dateRegex);

        let institution = '';
        let degree = '';
        let startDate = '';
        let endDate = '';

        if (dateMatch) {
            endDate = dateMatch[2];
            startDate = dateMatch[1];
        }

        // First line usually institution or degree
        if (lines[0]) {
            if (lines[0].toLowerCase().includes('university') || lines[0].toLowerCase().includes('college') ||
                lines[0].toLowerCase().includes('institute') || lines[0].toLowerCase().includes('school')) {
                institution = lines[0].trim();
                degree = lines[1] ? lines[1].trim() : '';
            } else {
                degree = lines[0].trim();
                institution = lines[1] ? lines[1].trim() : '';
            }
        }

        if (institution || degree) {
            education.push({
                id: `edu-${Date.now()}-${index}`,
                institution,
                degree,
                startDate,
                endDate
            });
        }
    });

    return education;
}

/**
 * Parse skills section
 */
function parseSkills(text: string): string[] {
    const sections = text.split(/(?:^|\n)(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)/i);

    if (sections.length < 2) return [];

    const skillsText = sections[1].split(/(?:^|\n)(?:EXPERIENCE|EDUCATION|CERTIFICATIONS)/i)[0];

    // Split by common delimiters
    const skillItems = skillsText
        .split(/[,•\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 50) // Reasonable skill length
        .filter(s => !s.match(/^\d+$/)) // Not just numbers
        .slice(0, 20); // Limit to 20 skills

    return skillItems;
}

/**
 * Parse summary/objective section
 */
function parseSummary(text: string): string {
    const summaryRegex = /(?:^|\n)(?:PROFESSIONAL SUMMARY|SUMMARY|PROFILE|OBJECTIVE)[\s:]*(.*?)(?=\n(?:EXPERIENCE|EDUCATION|SKILLS)|$)/is;
    const match = text.match(summaryRegex);

    if (match && match[1]) {
        return match[1].trim().substring(0, 500); // Limit length
    }

    // If no explicit summary, try to extract from first paragraph after name
    const lines = text.split('\n').filter(l => l.trim());
    for (let i = 1; i < Math.min(lines.length, 5); i++) {
        const line = lines[i].trim();
        if (line.length > 100 && !line.includes('@') && !line.includes('http')) {
            return line.substring(0, 500);
        }
    }

    return '';
}

/**
 * Main parsing function
 */
export async function parseResumeFile(file: File): Promise<ParsedData> {
    let text = '';

    // Extract text based on file type
    if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(file);
    } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX files.');
    }

    // Parse sections
    const parsedData: ParsedData = {
        personalInfo: {
            name: extractName(text),
            email: extractEmail(text),
            phone: extractPhone(text),
            address: '',
            linkedin: extractLinkedIn(text),
            github: extractGitHub(text),
        },
        summary: parseSummary(text),
        experience: parseExperience(text),
        education: parseEducation(text),
        skills: parseSkills(text),
    };

    return parsedData;
}

/**
 * Convert parsed data to ResumeData format
 */
export function convertParsedDataToResume(parsed: ParsedData): Partial<ResumeData> {
    const defaultLayout: LayoutItem[] = [
        { id: 'summary', name: 'Professional Summary', enabled: true },
        { id: 'experience', name: 'Work Experience', enabled: true },
        { id: 'education', name: 'Education', enabled: true },
        { id: 'skills', name: 'Skills', enabled: true },
        { id: 'customSections', name: 'Custom Sections', enabled: true },
    ];

    return {
        personalInfo: parsed.personalInfo,
        summary: parsed.summary,
        experience: parsed.experience,
        education: parsed.education,
        skills: parsed.skills,
        customSections: [],
        layout: defaultLayout,
        styles: initialResumeStyle,
    };
}
