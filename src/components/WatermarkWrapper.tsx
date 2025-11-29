import React, { ComponentType } from 'react';
import { ResumeData } from '@/types/resume';

export const withWatermark = (WrappedComponent: ComponentType<{ resumeData: ResumeData }>) => {
    return (props: { resumeData: ResumeData }) => (
        <div className="relative">
            <WrappedComponent {...props} />
            <div
                className="absolute bottom-6 right-8 opacity-50 text-[10px] font-bold tracking-wider uppercase pointer-events-none z-50 print:block"
                style={{ color: 'var(--primary-font-color)' }}
            >
                Created with NEUCV
            </div>
        </div>
    );
};
