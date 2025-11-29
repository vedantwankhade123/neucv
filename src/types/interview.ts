export type InterviewLanguage = 'english' | 'hinglish' | 'marathi' | 'hindi';
export type InterviewDuration = 15 | 30 | 45 | 60;
export type InterviewQuestionCount = 5 | 10 | 15 | 20;
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface InterviewSetupData {
    resumeFile: File;
    resumeText: string;
    jobRole: string;
    duration: InterviewDuration;
    numQuestions: InterviewQuestionCount;
    language: InterviewLanguage;
}

export interface InterviewQuestion {
    id: string;
    question: string;
    category: string;
    difficulty: QuestionDifficulty;
}

export interface InterviewResponse {
    questionId: string;
    answer: string;
    audioBlob?: Blob;
    timestamp: number;
    duration: number; // seconds spent on this question
    evaluation?: {
        score: number; // 0-100
        feedback: string;
        strengths: string[];
        improvements: string[];
    };
}

export interface InterviewReport {
    overallScore: number; // 0-100
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
    performanceByCategory: {
        category: string;
        score: number;
    }[];
}

export interface InterviewData {
    id: string;
    userId?: string;
    setupData: InterviewSetupData;
    questions: InterviewQuestion[];
    responses: InterviewResponse[];
    startTime: number;
    endTime?: number;
    currentQuestionIndex: number;
    status: 'setup' | 'in-progress' | 'completed';
    report?: InterviewReport;
}

export interface InterviewHistoryItem {
    id: string;
    jobRole: string;
    date: number;
    score: number;
    duration: number;
    numQuestions: number;
    language: InterviewLanguage;
}
