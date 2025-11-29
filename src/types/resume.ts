export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CustomSectionItem {
  id: string;
  title?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'experience';
  content: string; // Used for 'text' type
  items?: CustomSectionItem[]; // Used for 'list' and 'experience' types
  organization?: string; // Legacy support
  startDate?: string; // Legacy support
  endDate?: string; // Legacy support
}

export interface LayoutItem {
  id: string;
  name: string;
  enabled: boolean;
}

export interface ResumeData {
  id: string;
  userId?: string; // Optional for now to support legacy local data
  title: string;
  templateId: string;
  lastModified: number;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  customSections: CustomSection[];
  layout: LayoutItem[];
  styles: ResumeStyle;
}

export interface ResumeStyle {
  fontFamily: string;
  fontSize: string;
  headingFontSize?: string;
  accentColor: string;
  sectionSpacing: string;
  pageMargins: string;
  lineHeight?: string;
  sectionHeaderStyle?: 'uppercase' | 'capitalize' | 'underlined' | 'boxed';
  primaryBackgroundColor?: string;
  secondaryBackgroundColor?: string;
  primaryFontColor?: string;
  secondaryFontColor?: string;
}