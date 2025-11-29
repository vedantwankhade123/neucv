import React from 'react';
import { CoverLetterData } from '@/types/coverletter';
import { coverLetterTemplates } from '@/lib/coverletter-templates';

interface CoverLetterPreviewContainerProps {
    data: CoverLetterData;
    templateId: string;
    zoom: number;
    containerRef: React.RefObject<HTMLDivElement>;
}

const CoverLetterPreviewContainer = ({ data, templateId, zoom, containerRef }: CoverLetterPreviewContainerProps) => {
    const TemplateComponent = coverLetterTemplates[templateId]?.component || coverLetterTemplates.classic.component;

    return (
        <div className="w-full h-full relative">
            <div ref={containerRef} className="w-full h-full overflow-auto p-4 md:p-8 hide-scrollbar">
                <div className="flex items-start justify-center">
                    <div
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center',
                            width: '210mm',
                            height: '297mm',
                        }}
                        className="transition-transform duration-200 ease-in-out shadow-2xl border border-slate-200/50 bg-white flex-shrink-0"
                    >
                        <TemplateComponent data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverLetterPreviewContainer;
