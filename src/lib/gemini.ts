import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to check if we should use personal key
export const shouldForcePersonalKey = () => {
  // This will be checked against user profile in the components
  return localStorage.getItem('always_use_personal_key') === 'true';
};

const getApiKey = (forcePersonal: boolean = false) => {
  const customKey = localStorage.getItem('gemini_api_key');

  // If forcing personal key or if user has set preference
  if (forcePersonal || shouldForcePersonalKey()) {
    if (customKey) return customKey;
    // If forced but no key, throw error
    throw new Error('No personal API key found. Please add your Gemini API key in Settings.');
  }

  // Default platform key
  const defaultKey = import.meta.env.VITE_GEMINI_API_KEY;

  return defaultKey || customKey || '';
};

// Initialize with a placeholder, actual key will be fetched dynamically
let API_KEY = '';
try {
  // We'll use a dummy key for initial load if nothing is there to prevent crash
  API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || 'placeholder';
} catch (e) {
  console.warn('Error initializing API key');
}

const genAI = new GoogleGenerativeAI(API_KEY || 'placeholder');

// Helper to clean and parse JSON from AI response
const cleanAndParseJSON = (text: string) => {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?|```/g, '').trim();

    // Find the JSON object or array
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    let startIndex = -1;
    // Determine which comes first to decide if it's an object or array
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIndex = firstBrace;
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
    }

    if (startIndex !== -1) {
      const lastBrace = cleaned.lastIndexOf('}');
      const lastBracket = cleaned.lastIndexOf(']');
      const endIndex = Math.max(lastBrace, lastBracket) + 1;
      cleaned = cleaned.substring(startIndex, endIndex);
    }

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error on text:", text);
    throw new Error("Failed to parse AI response. The model might have returned invalid JSON.");
  }
};

// Comprehensive list of models to try in order of preference
const MODEL_FALLBACKS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro-001',
  'gemini-1.5-pro-002',
  'gemini-1.0-pro',
  'gemini-pro',
  'gemini-pro-vision'
];

export const generateContent = async (prompt: string, preferredModel: string = 'gemini-1.5-flash', apiKey?: string) => {
  let currentKey = apiKey;

  if (!currentKey) {
    try {
      currentKey = getApiKey();
    } catch (error) {
      throw new Error('Please add your Gemini API key in Settings to use AI features. Get a free key at https://aistudio.google.com/app/apikey');
    }
  }

  if (!currentKey) {
    throw new Error('No API key available. Please add your Gemini API key in Settings or contact support.');
  }

  // Re-initialize if key changed (simple way is to just create new instance here or rely on the global one if page reloads)
  // For robustness in this function, let's use a local instance if we want to support hot-swapping without reload, 
  // but the global `genAI` is initialized at module load. 
  // To support dynamic key changes without reload, we should re-instantiate genAI here or make genAI a function.
  // For now, let's assume the user might reload or we just re-create the client here for safety if using custom key.
  const dynamicGenAI = new GoogleGenerativeAI(currentKey);

  // Create a unique list starting with preferred model
  const modelsToTry = [...new Set([preferredModel, ...MODEL_FALLBACKS])];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = dynamicGenAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return text;
    } catch (error: any) {
      lastError = error;

      const isModelError = error.message?.includes('404') ||
        error.message?.includes('not found') ||
        error.message?.includes('not supported');

      if (!isModelError) {
        console.error(`Gemini API Error (${modelName}):`, error);
        throw new Error(error?.message || 'Gemini API request failed.');
      }

      console.warn(`Model ${modelName} failed (${error.status || 'unknown'}), trying next...`);
    }
  }

  console.error('All Gemini models failed. Last error:', lastError);

  if (lastError?.message?.includes('404')) {
    throw new Error('API Error: Models not found. Please ensure "Generative Language API" is ENABLED in your Google Cloud Console for this API key.');
  }

  throw new Error('Failed to generate content. Unable to find a supported Gemini model for your API key/region.');
};

export const generateResumeSummary = async (
  jobTitle: string,
  experience: any[] | string,
  education: any[],
  skills: string[],
  achievements: string = '',
  tone: string = 'professional',
  modelName?: string,
  apiKey?: string
) => {
  let expText = '';
  if (Array.isArray(experience)) {
    expText = experience.map(e => `${e.role} at ${e.company}`).join(', ');
  } else {
    expText = experience;
  }

  const skillsText = skills.join(', ');

  const prompt = `You are an expert executive resume writer. Write a compelling, high-impact professional summary for a ${jobTitle}.
  
  Candidate Profile:
  - Experience: ${expText}
  - Core Skills: ${skillsText}
  - Key Achievements: ${achievements}
  - Desired Tone: ${tone}
  
  Guidelines:
  - Write in the first person (implied "I"), do not use pronouns like "I", "me", "my".
  - Focus on unique value proposition, key achievements, and career trajectory.
  - Keep it between 3-5 powerful, punchy sentences.
  - Use strong, active professional language.
  - Integrate relevant ATS keywords for a ${jobTitle} role.
  
  Return ONLY the summary paragraph text. No markdown, no quotes.`;

  return (await generateContent(prompt, modelName, apiKey)).trim();
};

export const generateExperienceDescription = async (role: string, company: string, existingDescription: string = '', resumeContext?: any, startDate?: string, endDate?: string, modelName?: string, apiKey?: string) => {
  const prompt = `You are a senior resume consultant. Generate 4-6 high-impact, results-oriented bullet points for the role of ${role} at ${company}.
  
  Context / Draft: "${existingDescription}"
  
  Guidelines:
  - Start EVERY bullet point with a strong, dynamic action verb (e.g., Spearheaded, Orchestrated, Engineered, Accelerated).
  - Use the "Action + Result + Metric" formula where possible.
  - Quantify achievements with numbers, percentages, or concrete metrics (e.g., "Increased revenue by 25%", "Reduced latency by 40%"). If exact numbers aren't known, use plausible placeholders like [X]%.
  - Focus on accomplishments and business impact, not just responsibilities.
  - Tailor the language to be highly relevant for a ${role} position.
  
  Return ONLY the bullet points as a plain list (using •). Do not include any introductory text or markdown headers.`;

  return (await generateContent(prompt, modelName, apiKey)).trim();
};

export const generateSkills = async (jobTitle: string, modelName?: string, apiKey?: string): Promise<string> => {
  const prompt = `Act as an ATS (Applicant Tracking System) expert. List the top 12-15 most critical hard and soft skills for a ${jobTitle}.
  
  Guidelines:
  - Prioritize high-value keywords that recruiters search for.
  - Include specific tools, technologies, and methodologies relevant to ${jobTitle}.
  - Balance technical proficiency with essential soft skills (e.g., Leadership, Strategic Planning).
  
  Return ONLY a comma-separated list of skills. No categories, no bullet points.`;

  return (await generateContent(prompt, modelName, apiKey)).trim();
};

export const generateContextAwareSkills = async (resumeData: any, count: number = 6, modelName?: string, apiKey?: string) => {
  const prompt = `Based on the detailed resume profile below, extract the top ${count} most impactful skills that will maximize ATS visibility.
  
  Resume Profile:
  Title: ${resumeData.title}
  Summary: ${resumeData.summary}
  Experience: ${JSON.stringify(resumeData.experience.map((e: any) => ({ role: e.role, company: e.company, desc: e.description })))}
  
  Guidelines:
  - Identify specific technologies, tools, and competencies mentioned or implied in the experience.
  - Ensure the skills are standard industry terms.
  - Exclude generic or weak skills.
  
  Return ONLY a comma-separated list of skills.`;

  return (await generateContent(prompt, modelName, apiKey)).trim();
};

export const generateEducationDescription = async (degree: string, institution: string, keywords: string = '', resumeContext?: any, modelName?: string, apiKey?: string) => {
  const prompt = `Generate a concise, professional description for an education entry: ${degree} at ${institution}.
  
  Keywords/Focus: ${keywords}
  
  Guidelines:
  - Mention relevant coursework, honors, or key academic achievements if implied by the degree.
  - Keep it brief (1-2 sentences or 2-3 short bullets).
  - Focus on academic excellence and relevance to the candidate's career.
  
  Return ONLY the text.`;
  return (await generateContent(prompt, modelName, apiKey)).trim();
};

export const generateCustomSectionContent = async (sectionTitle: string, sectionType: 'text' | 'list' | 'experience', keywords: string = '', resumeContext?: any, modelName?: string, apiKey?: string) => {
  const prompt = `You are a resume expert. Generate professional content for a resume section titled "${sectionTitle}".
  
  Format: ${sectionType}
  Context/Keywords: ${keywords}
  
  Guidelines:
  - Ensure the tone is professional and consistent with a high-quality resume.
  - If it's a list, provide relevant items separated by commas or bullets.
  - If it's text, write a cohesive paragraph or bullet points.
  - Focus on adding value to the candidate's profile.
  
  Return ONLY the content text.`;
  return (await generateContent(prompt, modelName, apiKey)).trim();
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
  modelName?: string,
  apiKey?: string
): Promise<ResumeAgentResponse> => {
  const historyText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `You are an expert Resume Strategist and Career Coach. Your goal is to help the user build a top-tier, ATS-optimized resume.
  
  Current Resume Data:
  ${JSON.stringify(currentResumeData, null, 2)}
  
  Conversation History:
  ${historyText}
  
  User Request: "${userPrompt}"
  
  Instructions:
  1. Analyze the user's request and the current state of the resume.
  2. If the user asks to write, rewrite, or improve a section, generate high-quality, professional content using action verbs, metrics, and industry keywords.
  3. If the user provides raw information, format it professionally for a resume.
  4. If information is missing (e.g., dates, company names) that is critical for a section, ask for clarification in the 'message' field and set 'needsClarification' to true.
  5. Be helpful, encouraging, and professional.
  
  Return a JSON object with this exact structure:
  {
    "message": "A friendly, professional response to the user, explaining what you did or asking for necessary details.",
    "updates": {
      "personalInfo": {}, 
      "title": "New Job Title",
      "summary": "New Professional Summary",
      "experience": [], 
      "education": [],
      "skills": [],
      "customSections": []
    },
    "needsClarification": boolean,
    "clarificationQuestions": ["Question 1", "Question 2"]
  }
  
  Return ONLY valid JSON.
  `;

  try {
    const responseText = await generateContent(prompt, modelName, apiKey);
    const parsed = cleanAndParseJSON(responseText);

    return {
      message: parsed.message || "I've processed your request.",
      updates: parsed.updates || {},
      needsClarification: parsed.needsClarification || false,
      clarificationQuestions: parsed.clarificationQuestions || []
    };
  } catch (error) {
    console.error("Error processing resume agent prompt:", error);
    return {
      message: "I'm sorry, I encountered an error while processing your request. Please try again.",
      needsClarification: false
    };
  }
};

// ============================================
// Interview Coach AI Functions
// ============================================

export const generateInterviewQuestions = async (
  resumeText: string,
  jobRole: string,
  numQuestions: number,
  language: string,
  modelName?: string,
  apiKey?: string
) => {
  const languageInstructions = {
    english: 'Generate questions in English.',
    hinglish: 'Generate questions in Hinglish (mix of Hindi and English, written in English script).',
    marathi: 'Generate questions in Marathi language.',
    hindi: 'Generate questions in Hindi language.'
  };

  const prompt = `You are an expert Senior Technical Recruiter and Hiring Manager. Prepare a rigorous interview question set for a candidate applying for: ${jobRole}.
  
  Candidate Resume Context:
  ${resumeText.substring(0, 10000)}
  
  Requirements:
  - Generate exactly ${numQuestions} questions.
  - Include a mix of Behavioral (STAR method), Technical (role-specific), and Situational questions.
  - Tailor questions specifically to the candidate's experience level and the job role.
  - ${languageInstructions[language as keyof typeof languageInstructions] || 'Generate in English.'}
  
  Return ONLY a JSON array with this structure:
  [
    {
      "id": "1",
      "question": "The actual question text",
      "category": "Behavioral" | "Technical" | "Situational",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]`;

  try {
    const response = await generateContent(prompt, modelName, apiKey);
    return cleanAndParseJSON(response);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const evaluateInterviewResponse = async (
  question: string,
  response: string,
  language: string,
  modelName?: string,
  apiKey?: string
) => {
  const prompt = `Act as an expert Hiring Manager. Evaluate the following interview response.
  
  Question: "${question}"
  Candidate Response: "${response}"
  Language Context: ${language}
  
  Evaluation Criteria:
  - Clarity and Communication Style
  - Relevance to the Question
  - Depth of Knowledge / Technical Accuracy
  - Use of Examples (STAR method)
  
  Return ONLY a JSON object:
  {
    "score": number (0-100),
    "feedback": "Constructive, detailed feedback explaining the score and how to improve.",
    "strengths": ["Key strength 1", "Key strength 2"],
    "improvements": ["Specific actionable improvement 1", "Specific actionable improvement 2"]
  }`;

  try {
    const responseText = await generateContent(prompt, modelName, apiKey);
    return cleanAndParseJSON(responseText);
  } catch (error) {
    console.error('Error evaluating response:', error);
    throw error;
  }
};

export const generateInterviewReport = async (
  interviewData: any,
  modelName?: string,
  apiKey?: string
) => {
  const { setupData, questions, responses } = interviewData;

  const prompt = `You are a Senior Interview Coach. Generate a comprehensive performance report for a mock interview for the role of ${setupData.jobRole}.
  
  Interview Transcript Summary:
  ${questions.map((q: any, i: number) => `Q: ${q.question}\nA: ${responses[i]?.answer || 'No answer'}`).join('\n').substring(0, 10000)}
  
  Return ONLY a JSON object:
  {
    "overallScore": number (0-100),
    "strengths": ["Major strength 1", "Major strength 2", "Major strength 3"],
    "areasForImprovement": ["Critical area to improve 1", "Critical area to improve 2"],
    "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
    "performanceByCategory": [
      {"category": "Technical Knowledge", "score": number},
      {"category": "Communication", "score": number},
      {"category": "Problem Solving", "score": number},
      {"category": "Cultural Fit", "score": number}
    ]
  }`;

  try {
    const responseText = await generateContent(prompt, modelName, apiKey);
    return cleanAndParseJSON(responseText);
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};