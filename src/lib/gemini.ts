import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not configured');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export const generateContent = async (prompt: string, modelName: string = 'gemini-1.5-pro') => {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file');
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error?.message || 'Failed to generate content');
  }
};

export const generateResumeSummary = async (jobTitle: string, experience: any[], education: any[], skills: string[], modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Create a professional summary for a ${jobTitle}. Return ONLY the summary text.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateExperienceDescription = async (role: string, company: string, existingDescription: string = '', resumeContext?: any, startDate?: string, endDate?: string, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Generate bullet points for ${role} at ${company}. Return ONLY bullet points.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateSkills = async (jobTitle: string, modelName: string = 'gemini-1.5-pro'): Promise<string> => {
  const prompt = `List skills for ${jobTitle}. Return comma-separated list.`;
  return generateContent(prompt, modelName);
};

export const generateContextAwareSkills = async (resumeData: any, count: number = 6, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Generate ${count} skills for resume. Return comma-separated.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateEducationDescription = async (degree: string, institution: string, keywords: string = '', resumeContext?: any, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Education description for ${degree} at ${institution}.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateCustomSectionContent = async (sectionTitle: string, sectionType: 'text' | 'list' | 'experience', keywords: string = '', resumeContext?: any, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Generate ${sectionType} content for ${sectionTitle}.`;
  return (await generateContent(prompt, modelName)).trim();
};

export interface ResumeAgentResponse {
  message: string;
  updates?: {
    personalInfo?: Partial<any>;
    title?: string;
    summary?: string;
    experience?: any[];
    education?: any[];
    skills?: string[];
    customSections?: any[];
  };
  needsClarification?: boolean;
  clarificationQuestions?: string[];
}

export const processResumeAgentPrompt = async (
  userPrompt: string,
  currentResumeData: any,
  conversationHistory: any[] = [],
  modelName: string = 'gemini-1.5-pro'
): Promise<ResumeAgentResponse> => {
  return {
    message: 'I can help with your resume.',
    needsClarification: false
  };
};

export const generateCoverLetterOpening = async (position: string, companyName: string, resumeData?: any, coverLetterData?: any, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Cover letter opening for ${position} at ${companyName}.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateCoverLetterBody = async (position: string, companyName: string, resumeData?: any, coverLetterData?: any, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Cover letter body for ${position} at ${companyName}.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateCoverLetterClosing = async (position: string, companyName: string, resumeData?: any, coverLetterData?: any, modelName: string = 'gemini-1.5-pro') => {
  const prompt = `Cover letter closing for ${position} at ${companyName}.`;
  return (await generateContent(prompt, modelName)).trim();
};
