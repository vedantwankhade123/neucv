import { useRef, useEffect, useState } from 'react';
import { resumeTemplates } from '@/lib/resume-templates';
import { ResumeData } from '@/types/resume';
import { initialResumeStyle } from '@/data/initialData';

interface ResumePreviewProps {
  resume: ResumeData;
  className?: string;
  showHoverEffect?: boolean;
}

export const ResumePreview = ({ resume, className = '', showHoverEffect = false }: ResumePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);
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

  // Calculate optimal scale based on container dimensions
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // A4 dimensions in pixels at 96 DPI
        const a4WidthPx = 794;
        const a4HeightPx = 1123;

        // Use a small margin to prevent content from touching the edges
        const margin = 0.95; // Use 95% of available space
        const availableWidth = containerWidth * margin;
        const availableHeight = containerHeight * margin;

        // Calculate scale based on available space, fitting the whole A4 content
        const scaleX = availableWidth / a4WidthPx;
        const scaleY = availableHeight / a4HeightPx;
        const optimalScale = Math.min(scaleX, scaleY);

        setScale(optimalScale > 0 ? optimalScale : 0.28); // Fallback to default if calculation fails
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
  const a4WidthPx = 794;

  return (
    <div
      ref={containerRef}
      className={`aspect-[210/297] w-full bg-white shadow-lg overflow-hidden rounded-md transition-transform duration-200 ${showHoverEffect ? '' : 'pointer-events-none'} ${className}`}
      style={{
        transform: showHoverEffect && isHovered ? 'scale(1.01)' : 'scale(1)',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
      onMouseEnter={() => showHoverEffect && setIsHovered(true)}
      onMouseLeave={() => showHoverEffect && setIsHovered(false)}
    >
      <div
        ref={contentRef}
        className="pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          willChange: 'transform',
          width: `${a4WidthPx}px`,
          flexShrink: 0,
        }}
      >
        <div style={styleVariables}>
          <TemplateComponent resumeData={resume} />
        </div>
      </div>
    </div>
  );
};