import ClassicTemplate from '@/components/templates/ClassicTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import CorporateTemplate from '@/components/templates/CorporateTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalistTemplate from '@/components/templates/MinimalistTemplate';
import CrispTemplate from '@/components/templates/CrispTemplate';
import CleanTemplate from '@/components/templates/CleanTemplate';
import ContemporaryTemplate from '@/components/templates/ContemporaryTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import ChicTemplate from '@/components/templates/ChicTemplate';
import ImpactfulTemplate from '@/components/templates/ImpactfulTemplate';
import DesignerTemplate from '@/components/templates/DesignerTemplate';
import GreenfieldTemplate from '@/components/templates/GreenfieldTemplate';
import CorporateBlueTemplate from '@/components/templates/CorporateBlueTemplate';
import ATSFriendlyTemplate from '@/components/templates/ATSFriendlyTemplate';
import TechModernTemplate from '@/components/templates/TechModernTemplate';
import ProfessionalPortfolioTemplate from '@/components/templates/ProfessionalPortfolioTemplate';
import { ResumeData } from '@/types/resume';
import { ComponentType } from 'react';
import { withWatermark } from '@/components/WatermarkWrapper';

export type TemplateCategory = 'Creative' | 'Professional' | 'Modern' | 'Simple';

export interface Template {
  name: string;
  component: ComponentType<{ resumeData: ResumeData }>;
  category: TemplateCategory;
  photoRequired?: boolean;
  isPremium?: boolean;
}

export const resumeTemplates: Record<string, Template> = {
  classic: { name: 'Classic', component: withWatermark(ClassicTemplate), category: 'Professional', isPremium: false },
  corporate: { name: 'Corporate', component: withWatermark(CorporateTemplate), category: 'Professional', photoRequired: true, isPremium: false },
  executive: { name: 'Executive', component: withWatermark(ExecutiveTemplate), category: 'Professional', photoRequired: false, isPremium: false },
  crisp: { name: 'Crisp', component: withWatermark(CrispTemplate), category: 'Professional', photoRequired: false, isPremium: false },
  clean: { name: 'Clean', component: withWatermark(CleanTemplate), category: 'Professional', photoRequired: false, isPremium: false },
  elegant: { name: 'Elegant', component: withWatermark(ElegantTemplate), category: 'Professional', photoRequired: false, isPremium: false },
  greenfield: { name: 'Greenfield', component: withWatermark(GreenfieldTemplate), category: 'Modern', photoRequired: true, isPremium: false },
  'corporate-blue': { name: 'Corporate Blue', component: withWatermark(CorporateBlueTemplate), category: 'Professional', photoRequired: true, isPremium: false },
  'ats-friendly': { name: 'ATS Friendly', component: withWatermark(ATSFriendlyTemplate), category: 'Professional', photoRequired: true, isPremium: false },
  modern: { name: 'Modern', component: withWatermark(ModernTemplate), category: 'Modern', photoRequired: true, isPremium: false },
  contemporary: { name: 'Contemporary', component: withWatermark(ContemporaryTemplate), category: 'Modern', photoRequired: true, isPremium: false },
  chic: { name: 'Chic', component: withWatermark(ChicTemplate), category: 'Modern', photoRequired: true, isPremium: false },
  impactful: { name: 'Impactful', component: withWatermark(ImpactfulTemplate), category: 'Modern', photoRequired: true, isPremium: false },
  designer: { name: 'Designer', component: withWatermark(DesignerTemplate), category: 'Creative', photoRequired: true, isPremium: false },
  creative: { name: 'Creative', component: withWatermark(CreativeTemplate), category: 'Creative', isPremium: false },
  minimalist: { name: 'Minimalist', component: withWatermark(MinimalistTemplate), category: 'Simple', photoRequired: true, isPremium: false },
  'tech-modern': { name: 'Tech Modern', component: withWatermark(TechModernTemplate), category: 'Modern', photoRequired: true, isPremium: false },
  'professional-portfolio': { name: 'Professional Portfolio', component: withWatermark(ProfessionalPortfolioTemplate), category: 'Professional', photoRequired: false, isPremium: false },
};