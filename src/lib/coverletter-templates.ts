import ClassicCoverLetter from '@/components/templates/coverletters/ClassicCoverLetter';
import ModernCoverLetter from '@/components/templates/coverletters/ModernCoverLetter';
import MinimalistCoverLetter from '@/components/templates/coverletters/MinimalistCoverLetter';
import CreativeCoverLetter from '@/components/templates/coverletters/CreativeCoverLetter';
import { CoverLetterTemplate } from '@/types/coverletter';

export const coverLetterTemplates: Record<string, CoverLetterTemplate> = {
    classic: {
        id: 'classic',
        name: 'Classic',
        component: ClassicCoverLetter,
        category: 'Professional',
        isPremium: false,
    },
    modern: {
        id: 'modern',
        name: 'Modern',
        component: ModernCoverLetter,
        category: 'Modern',
        isPremium: false,
    },
    minimalist: {
        id: 'minimalist',
        name: 'Minimalist',
        component: MinimalistCoverLetter,
        category: 'Professional',
        isPremium: false,
    },
    creative: {
        id: 'creative',
        name: 'Creative',
        component: CreativeCoverLetter,
        category: 'Creative',
        isPremium: false,
    },
};
