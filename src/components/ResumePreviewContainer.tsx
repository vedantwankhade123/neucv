import React from 'react';
import { ResumeData, ResumeStyle } from '@/types/resume';
import { resumeTemplates } from '@/lib/resume-templates';

interface ResumePreviewContainerProps {
  resumeData: ResumeData;
  templateId: string;
  resumeStyle: ResumeStyle;
  zoom: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

const ResumePreviewContainer = ({ resumeData, templateId, resumeStyle, zoom, containerRef }: ResumePreviewContainerProps) => {
  const TemplateComponent = resumeTemplates[templateId]?.component;

  if (!TemplateComponent) {
    return <div className="flex items-center justify-center h-full">Error: Template not found.</div>;
  }

  const styleVariables = {
    '--font-family': resumeStyle.fontFamily,
    '--font-size-base': resumeStyle.fontSize,
    '--heading-font-size': resumeStyle.headingFontSize,
    '--accent-color': resumeStyle.accentColor,
    '--section-spacing': resumeStyle.sectionSpacing,
    '--page-margins': resumeStyle.pageMargins,
    '--primary-background-color': resumeStyle.primaryBackgroundColor,
    '--secondary-background-color': resumeStyle.secondaryBackgroundColor,
    '--primary-font-color': resumeStyle.primaryFontColor,
    '--secondary-font-color': resumeStyle.secondaryFontColor,
    '--line-height': resumeStyle.lineHeight || '1.5',
    '--section-header-style': resumeStyle.sectionHeaderStyle || 'uppercase',
  } as React.CSSProperties;

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full overflow-auto p-4 md:p-8 hide-scrollbar">
        <div className="flex items-start justify-center">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            className="transition-transform duration-200 ease-in-out shadow-2xl border border-slate-200/50 bg-white"
          >
            <div style={styleVariables}>
              <TemplateComponent resumeData={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewContainer;