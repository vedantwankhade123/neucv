import { ResumeData, ResumeStyle, LayoutItem } from '@/types/resume';
import { templates } from '@/data/templates';

export const initialLayout: LayoutItem[] = [
  { id: 'summary', name: 'Professional Summary', enabled: true },
  { id: 'experience', name: 'Work Experience', enabled: true },
  { id: 'education', name: 'Education', enabled: true },
  { id: 'skills', name: 'Skills', enabled: true },
  { id: 'customSections', name: 'Custom Sections', enabled: true },
];

export const initialResumeStyle: ResumeStyle = {
  fontFamily: 'sans-serif',
  fontSize: '14px',
  headingFontSize: '16px',
  accentColor: '#2563eb',
  sectionSpacing: '24px',
  pageMargins: '32px',
  primaryBackgroundColor: '#ffffff',
  secondaryBackgroundColor: '#f8fafc',
  primaryFontColor: '#111827',
  secondaryFontColor: '#374151',
};

export const initialResumeData: ResumeData = {
  ...templates[0].data,
  personalInfo: {
    ...templates[0].data.personalInfo,
    photoUrl: '/placeholder.svg',
  },
  layout: initialLayout,
  styles: initialResumeStyle,
};