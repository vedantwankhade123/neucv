import { ResumeStyle } from '@/types/resume';

export interface Theme {
    id: string;
    name: string;
    styles: Partial<ResumeStyle>;
    previewColor: string;
}

export const themes: Theme[] = [
    {
        id: 'modern-blue',
        name: 'Modern Blue',
        styles: {
            accentColor: '#2563eb',
            primaryBackgroundColor: '#ffffff',
            secondaryBackgroundColor: '#f8fafc',
            primaryFontColor: '#111827',
            secondaryFontColor: '#374151',
            fontFamily: 'sans-serif',
        },
        previewColor: '#2563eb',
    },
    {
        id: 'professional-gray',
        name: 'Professional Gray',
        styles: {
            accentColor: '#4b5563',
            primaryBackgroundColor: '#ffffff',
            secondaryBackgroundColor: '#f3f4f6',
            primaryFontColor: '#1f2937',
            secondaryFontColor: '#4b5563',
            fontFamily: 'serif',
        },
        previewColor: '#4b5563',
    },
    {
        id: 'creative-purple',
        name: 'Creative Purple',
        styles: {
            accentColor: '#7c3aed',
            primaryBackgroundColor: '#ffffff',
            secondaryBackgroundColor: '#f5f3ff',
            primaryFontColor: '#2e1065',
            secondaryFontColor: '#5b21b6',
            fontFamily: 'sans-serif',
        },
        previewColor: '#7c3aed',
    },
    {
        id: 'nature-green',
        name: 'Nature Green',
        styles: {
            accentColor: '#059669',
            primaryBackgroundColor: '#ffffff',
            secondaryBackgroundColor: '#ecfdf5',
            primaryFontColor: '#064e3b',
            secondaryFontColor: '#065f46',
            fontFamily: 'sans-serif',
        },
        previewColor: '#059669',
    },
    {
        id: 'warm-orange',
        name: 'Warm Orange',
        styles: {
            accentColor: '#ea580c',
            primaryBackgroundColor: '#ffffff',
            secondaryBackgroundColor: '#fff7ed',
            primaryFontColor: '#431407',
            secondaryFontColor: '#7c2d12',
            fontFamily: 'sans-serif',
        },
        previewColor: '#ea580c',
    },
    {
        id: 'elegant-dark',
        name: 'Elegant Dark',
        styles: {
            accentColor: '#d4d4d8',
            primaryBackgroundColor: '#18181b',
            secondaryBackgroundColor: '#27272a',
            primaryFontColor: '#f4f4f5',
            secondaryFontColor: '#a1a1aa',
            fontFamily: 'sans-serif',
        },
        previewColor: '#18181b',
    },
];
