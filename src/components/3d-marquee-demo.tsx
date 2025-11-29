"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { resumeTemplates } from "@/lib/resume-templates";
import { initialResumeStyle } from '@/data/initialData';
import React from 'react';
import { previewDataMap } from '@/data/previewData';
import { useIsMobile } from "@/hooks/use-mobile";

export default function ThreeDMarqueeDemo() {
  const isMobile = useIsMobile();
  const scale = isMobile ? 0.35 : 0.45;

  const styleVariables = {
    '--font-family': initialResumeStyle.fontFamily,
    '--font-size-base': initialResumeStyle.fontSize,
    '--accent-color': initialResumeStyle.accentColor,
    '--section-spacing': initialResumeStyle.sectionSpacing,
    '--page-margins': initialResumeStyle.pageMargins,
    '--primary-background-color': initialResumeStyle.primaryBackgroundColor,
    '--secondary-background-color': initialResumeStyle.secondaryBackgroundColor,
    '--primary-font-color': initialResumeStyle.primaryFontColor,
    '--secondary-font-color': initialResumeStyle.secondaryFontColor,
  } as React.CSSProperties;

  const excludedTemplates = ['classic', 'creative'];

  const resumePreviews = Object.entries(resumeTemplates)
    .filter(([id]) => !excludedTemplates.includes(id))
    .map(([id, template]) => {
      const TemplateComponent = template.component;
      const previewData = previewDataMap[id];
      if (!previewData) return null;
      return (
          <div key={id} className="w-[280px] h-[396px] sm:w-[358px] sm:h-[506px]">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <div style={styleVariables}>
                    <TemplateComponent resumeData={previewData} />
                </div>
            </div>
          </div>
      );
  }).filter(Boolean);

  // Duplicate the previews to ensure the marquee is well-populated
  const tripledPreviews = [...resumePreviews, ...resumePreviews, ...resumePreviews];

  return (
    <div className="mx-4 lg:mx-auto my-10 max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee items={tripledPreviews} />
    </div>
  );
}