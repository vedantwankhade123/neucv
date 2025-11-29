import { useRef, useEffect, useState } from 'react';
import { coverLetterTemplates } from '@/lib/coverletter-templates';
import { CoverLetterData } from '@/types/coverletter';
import { cn } from '@/lib/utils';

interface CoverLetterPreviewProps {
    data: CoverLetterData;
    className?: string;
    showHoverEffect?: boolean;
    scaleMode?: 'fit' | 'fill';
}

export const CoverLetterPreview = ({
    data,
    className = '',
    showHoverEffect = false,
    scaleMode = 'fit'
}: CoverLetterPreviewProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.38);
    const [isHovered, setIsHovered] = useState(false);

    const TemplateComponent = coverLetterTemplates[data.templateId]?.component || coverLetterTemplates.classic.component;

    // Calculate optimal scale based on container dimensions
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

                // Determine scale based on mode
                // 'fit': Contain (show full document)
                // 'fill': Cover (fill container, crop if necessary)
                const optimalScale = scaleMode === 'fill' ? scaleX : Math.min(scaleX, scaleY);

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
    }, [scaleMode]);

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
                alignItems: scaleMode === 'fill' ? 'flex-start' : 'center',
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
                    transformOrigin: scaleMode === 'fill' ? 'top center' : 'center center',
                    width: `${a4WidthPx}px`,
                    height: `${297 * 3.779527559}px`, // Explicit height to prevent layout shifts
                    flexShrink: 0,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    marginTop: scaleMode === 'fill' ? '16px' : '0'
                }}
            >
                <div className="h-full w-full bg-white">
                    <TemplateComponent data={data} />
                </div>
            </div>
        </div>
    );
};
