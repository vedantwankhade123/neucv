import { useRef, useEffect, useState } from 'react';
import { resumeTemplates } from '@/lib/resume-templates';
import { ResumeData } from '@/types/resume';
import { initialResumeStyle } from '@/data/initialData';
import { cn } from '@/lib/utils';

interface TemplatePreviewProps {
  resume: ResumeData;
  className?: string;
  showHoverEffect?: boolean;
}

export const TemplatePreview = ({ resume, className = '', showHoverEffect = false }: TemplatePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.38);
  const [isHovered, setIsHovered] = useState(false);

  const TemplateComponent = resumeTemplates[resume.templateId]?.component || resumeTemplates.classic.component;

  const styleVariables = {
    '--font-family': resume.styles?.fontFamily || initialResumeStyle.fontFamily,
    '--font-size-base': resume.styles?.fontSize || initialResumeStyle.fontSize,
    '--heading-font-size': resume.styles?.headingFontSize || initialResumeStyle.headingFontSize,
    '--accent-color': resume.styles?.accentColor || initialResumeStyle.accentColor,
    '--section-spacing': resume.styles?.sectionSpacing || initialResumeStyle.sectionSpacing,
    '--page-margins': resume.styles?.pageMargins || initialResumeStyle.pageMargins,
    '--primary-background-color': resume.styles?.primaryBackgroundColor || initialResumeStyle.primaryBackgroundColor,
    '--secondary-background-color': resume.styles?.secondaryBackgroundColor || initialResumeStyle.secondaryBackgroundColor,
    '--primary-font-color': resume.styles?.primaryFontColor || initialResumeStyle.primaryFontColor,
    '--secondary-font-color': resume.styles?.secondaryFontColor || initialResumeStyle.secondaryFontColor,
  } as React.CSSProperties;

  // Calculate optimal scale based on container dimensions for template previews
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // A4 dimensions in mm: 210 x 297
        // Standard print resolution: 96 DPI = 3.779527559 pixels per mm
        const pxPerMm = 3.779527559;
        const a4WidthPx = 210 * pxPerMm;  // ~794px
        const a4HeightPx = 297 * pxPerMm; // ~1123px

        // Use conservative margins to prevent overflow
        const marginX = 16; // 8px on each side
        const marginY = 16; // 8px on top and bottom
        const availableWidth = Math.max(100, containerWidth - (marginX * 2));
        const availableHeight = Math.max(100, containerHeight - (marginY * 2));

        // Calculate scale based on available space
        const scaleX = availableWidth / a4WidthPx;
        const scaleY = availableHeight / a4HeightPx;
        const optimalScale = Math.min(scaleX, scaleY);

        // Apply safety margin (95% of calculated scale) to prevent overflow
        const safeScale = optimalScale * 0.95;

        setScale(safeScale);
      }
    };

    const timer = setTimeout(updateScale, 150);

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateScale);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  // A4 width in pixels at 96 DPI
  const a4WidthPx = 794; // 210mm * 3.779527559

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-white rounded-lg transition-all duration-300 ease-out",
        showHoverEffect ? "hover:shadow-2xl hover:-translate-y-1" : "pointer-events-none",
        "shadow-md border border-slate-200/60 dark:border-slate-700/60",
        className
      )}
      style={{
        transform: showHoverEffect && isHovered ? 'scale(1.02)' : 'scale(1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
      onMouseEnter={() => showHoverEffect && setIsHovered(true)}
      onMouseLeave={() => showHoverEffect && setIsHovered(false)}
    >
      <div
        className="pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: `${a4WidthPx}px`,
          height: `${297 * 3.779527559}px`, // Explicit height to prevent layout shifts
          flexShrink: 0,
        }}
      >
        <div style={styleVariables} className="h-full w-full bg-white">
          <TemplateComponent resumeData={resume} />
        </div>
      </div>

      {/* Overlay for hover effect - optional, can be handled by parent */}
    </div>
  );
};
