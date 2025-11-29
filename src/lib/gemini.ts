import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not configured');
} else {
  console.log('Gemini Config Status:', {
    keyPresent: !!API_KEY,
    keyLength: API_KEY ? API_KEY.length : 0,
    keyPrefix: API_KEY ? API_KEY.substring(0, 5) + '...' : 'N/A'
  });
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

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

// List of models to try in order of preference/speed/cost
const MODEL_FALLBACKS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-002',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro'
];

export const generateContent = async (prompt: string, preferredModel: string = 'gemini-1.5-flash') => {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file and RESTART the dev server.');
  }

  // Create a unique list starting with preferred model
  const modelsToTry = [...new Set([preferredModel, ...MODEL_FALLBACKS])];
  
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      // console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // If we get here, it worked
      // console.log(`Success with model: ${modelName}`);
      return text;
    } catch (error: any) {
      lastError = error;
      
      // Only continue if it's a 404 (Not Found) or 400 (Invalid Argument/Not Supported)
      // For 403 (Permission/Quota), we should probably stop
      const isModelError = error.message?.includes('404') || 
                           error.message?.includes('not found') || 
                           error.message?.includes('not supported');
                           
      if (!isModelError) {
        console.error(`Gemini API Error (${modelName}):`, error);
        throw new Error(error?.message || 'Gemini API request failed.');
      }
      
      console.warn(`Model ${modelName} failed, trying next...`);
    }
  }

  // If we exhausted all models
  console.error('All Gemini models failed. Last error:', lastError);
  throw new Error('Failed to generate content. Unable to find a supported Gemini model for your API key/region.');
};

export const generateResumeSummary = async (jobTitle: string, experience: any[], education: any[], skills: string[], modelName?: string) => {
  const prompt = `Create a professional summary for a ${jobTitle}. Return ONLY the summary text, no markdown, no quotes.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateExperienceDescription = async (role: string, company: string, existingDescription: string = '', resumeContext?: any, startDate?: string, endDate?: string, modelName?: string) => {
  const prompt = `Generate professional bullet points for the role of ${role} at ${company}. Return ONLY the bullet points, starting with action verbs. Do not include introductory text.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateSkills = async (jobTitle: string, modelName?: string): Promise<string> => {
  const prompt = `List top technical and soft skills for a ${jobTitle}. Return a simple comma-separated list.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateContextAwareSkills = async (resumeData: any, count: number = 6, modelName?: string) => {
  const prompt = `Based on the following resume data, generate ${count} relevant skills. Return ONLY a comma-separated list.
  
  Resume Data:
  ${JSON.stringify(resumeData).substring(0, 1000)}...
  `;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateEducationDescription = async (degree: string, institution: string, keywords: string = '', resumeContext?: any, modelName?: string) => {
  const prompt = `Generate a brief description for an education entry: ${degree} at ${institution}. Include key achievements or coursework if implied. Return ONLY the text.`;
  return (await generateContent(prompt, modelName)).trim();
};

export const generateCustomSectionContent = async (sectionTitle: string, sectionType: 'text' | 'list' | 'experience', keywords: string = '', resumeContext?: any, modelName?: string) => {
  const prompt = `Generate content for a resume section titled "${sectionTitle}". The format is ${sectionType}. 
  Keywords/Context: ${keywords}
  Return ONLY the content text/bullet points suitable for a resume.`;
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
  modelName?: string
): Promise<ResumeAgentResponse> => {
  const historyText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `You are an expert resume writer AI agent. Help the user improve their resume.
  
  Current Resume Data:
  ${JSON.stringify(currentResumeData, null, 2)}
  
  Conversation History:
  ${historyText}
  
  User Request: ${userPrompt}
  
  Analyze the request.
  Return a JSON object with this structure:
  {
    "message": "Response to user",
    "updates": {
      "personalInfo": {}, 
      "title": "New Title",
      "summary": "New Summary",
      "experience": [], 
      "education": [],
      "skills": [],
      "customSections": []
    },
    "needsClarification": boolean,
    "clarificationQuestions": ["Question 1"]
  }
  
  Return ONLY valid JSON.
  `;

  try {
    const responseText = await generateContent(prompt, modelName);
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
  modelName?: string
) => {
  const languageInstructions = {
    english: 'Generate questions in English.',
    hinglish: 'Generate questions in Hinglish (mix of Hindi and English, written in English script).',
    marathi: 'Generate questions in Marathi language.',
    hindi: 'Generate questions in Hindi language.'
  };

  const prompt = `You are an expert interview coach. Generate ${numQuestions} interview questions based on:
  
Resume Text Summary: ${resumeText.substring(0, 1500)}
Job Role: ${jobRole}

${languageInstructions[language as keyof typeof languageInstructions] || 'Generate in English.'}

Return ONLY a JSON array:
[
  {
    "id": "1",
    "question": "Question text",
    "category": "Behavioral/Technical/Situational",
    "difficulty": "easy/medium/hard"
  }
]`;

  try {
    const response = await generateContent(prompt, modelName);
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
  modelName?: string
) => {
  const prompt = `Evaluate this interview response.
  
Question: ${question}
Response: ${response}
Language: ${language}

Return ONLY a JSON object:
{
  "score": number (0-100),
  "feedback": "Feedback text",
  "strengths": ["string"],
  "improvements": ["string"]
}`;

  try {
    const responseText = await generateContent(prompt, modelName);
    return cleanAndParseJSON(responseText);
  } catch (error) {
    console.error('Error evaluating response:', error);
    throw error;
  }
};

export const generateInterviewReport = async (
  interviewData: any,
  modelName?: string
) => {
  const { setupData, questions, responses } = interviewData;

  const prompt = `Generate an interview report for ${setupData.jobRole}.
  
Responses Summary:
${questions.map((q: any, i: number) => `Q: ${q.question}\nA: ${responses[i]?.answer || 'No answer'}`).join('\n').substring(0, 3000)}

Return ONLY a JSON object:
{
  "overallScore": number (0-100),
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "recommendations": ["string"],
  "performanceByCategory": [
    {"category": "string", "score": number}
  ]
}`;

  try {
    const responseText = await generateContent(prompt, modelName);
    return cleanAndParseJSON(responseText);
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};