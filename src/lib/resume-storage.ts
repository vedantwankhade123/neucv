import { ResumeData, ResumeStyle } from '@/types/resume';
import { initialResumeData, initialResumeStyle } from '@/data/initialData';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'resumes';

export const getResumes = (): ResumeData[] => {
  try {
    const resumesJson = localStorage.getItem(STORAGE_KEY);
    return resumesJson ? JSON.parse(resumesJson) : [];
  } catch (error) {
    console.error("Failed to parse resumes from localStorage", error);
    return [];
  }
};

const saveResumes = (resumes: ResumeData[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
};

export const getResume = (id: string): ResumeData | undefined => {
  return getResumes().find(resume => resume.id === id);
};

export const saveResume = (resumeToSave: ResumeData): void => {
  const resumes = getResumes();
  const index = resumes.findIndex(resume => resume.id === resumeToSave.id);
  const updatedResume = { ...resumeToSave, lastModified: Date.now() };

  if (index !== -1) {
    resumes[index] = updatedResume;
  } else {
    resumes.push(updatedResume);
  }
  saveResumes(resumes);
};

export const createResume = (templateId: string, styles?: ResumeStyle): ResumeData => {
  const newResume: ResumeData = {
    ...initialResumeData,
    id: uuidv4(),
    title: 'Untitled Resume',
    templateId: templateId,
    lastModified: Date.now(),
    styles: styles || initialResumeStyle,
  };
  const resumes = getResumes();
  resumes.unshift(newResume);
  saveResumes(resumes);
  return newResume;
};

export const duplicateResume = (id: string): ResumeData | undefined => {
  const resumeToDuplicate = getResume(id);
  if (!resumeToDuplicate) return undefined;

  const newResume: ResumeData = {
    ...resumeToDuplicate,
    id: uuidv4(),
    title: `Copy of ${resumeToDuplicate.title}`,
    lastModified: Date.now(),
  };

  const resumes = getResumes();
  resumes.unshift(newResume);
  saveResumes(resumes);
  return newResume;
};

export const deleteResume = (id: string): void => {
  let resumes = getResumes();
  resumes = resumes.filter(resume => resume.id !== id);
  saveResumes(resumes);
};

export const deleteAllResumes = (): void => {
  saveResumes([]);
};