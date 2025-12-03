import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResumeData, ResumeStyle } from '@/types/resume';
import { resumeTemplates } from '@/lib/resume-templates';
import { Download, X, ZoomIn, ZoomOut, Minimize } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  templateId: string;
  resumeStyle: ResumeStyle;
}

const PreviewModal = ({ isOpen, onClose, resumeData, templateId, resumeStyle }: PreviewModalProps) => {
  const downloadResumeRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const TemplateComponent = resumeTemplates[templateId]?.component;
  const [zoom, setZoom] = useState(0.74);

  const fitToScreen = () => {
    if (previewContainerRef.current && downloadResumeRef.current) {
      const containerStyle = window.getComputedStyle(previewContainerRef.current);
      const paddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
      const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);

      const availableWidth = previewContainerRef.current.clientWidth - paddingX;
      const availableHeight = previewContainerRef.current.clientHeight - paddingY;

      const contentWidth = downloadResumeRef.current.offsetWidth;
      const contentHeight = downloadResumeRef.current.offsetHeight;

      if (contentWidth <= 0 || contentHeight <= 0) return;

      const scaleX = availableWidth / contentWidth;
      const scaleY = availableHeight / contentHeight;

      const newScale = Math.min(scaleX, scaleY, 1) * 0.95;

      setZoom(newScale > 0 ? newScale : 1);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // A short delay to allow the dialog and layout to render before fitting.
      // const timer = setTimeout(fitToScreen, 100);
      window.addEventListener('resize', fitToScreen);
      return () => {
        // clearTimeout(timer);
        window.removeEventListener('resize', fitToScreen);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDownloadPdf = async () => {
    const resumeElement = downloadResumeRef.current;
    if (!resumeElement) return;

    const canvas = await html2canvas(resumeElement, {
      scale: 3,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = 210;
    const pdfHeight = 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${resumeData.personalInfo.name.replace(' ', '_')}_Resume.pdf`);
  };

  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const resumeElement = downloadResumeRef.current;
    if (!resumeElement) return;

    const canvas = await html2canvas(resumeElement, {
      scale: 3,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL(`image/${format}`);
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.${format === 'jpeg' ? 'jpg' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadHtml = () => {
    const resumeElement = downloadResumeRef.current;
    if (!resumeElement) return;

    const htmlContent = resumeElement.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${resumeData.personalInfo.name}'s Resume</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            font-family: ${resumeStyle.fontFamily};
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background-color: #f0f0f0;
            padding: 2rem;
          }
          :root {
            --font-family: ${resumeStyle.fontFamily};
            --font-size-base: ${resumeStyle.fontSize};
            --heading-font-size: ${resumeStyle.headingFontSize};
            --accent-color: ${resumeStyle.accentColor};
            --section-spacing: ${resumeStyle.sectionSpacing};
            --page-margins: ${resumeStyle.pageMargins};
            --primary-background-color: ${resumeStyle.primaryBackgroundColor || '#ffffff'};
            --secondary-background-color: ${resumeStyle.secondaryBackgroundColor || '#f8fafc'};
            --primary-font-color: ${resumeStyle.primaryFontColor || '#111827'};
            --secondary-font-color: ${resumeStyle.secondaryFontColor || '#374151'};
            --line-height: ${resumeStyle.lineHeight || '1.5'};
            --section-header-style: ${resumeStyle.sectionHeaderStyle || 'uppercase'};
          }
        </style>
      </head>
      <body>
        <div style="width: 210mm; min-height: 297mm;">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!TemplateComponent) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] md:h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Download</DialogTitle>
        </DialogHeader>
        <div className="grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-5 flex-grow min-h-0">
          <div className="md:col-span-3 bg-secondary relative overflow-hidden">
            <div ref={previewContainerRef} className="w-full h-full p-4 md:p-8 overflow-auto hide-scrollbar">
              <div className="flex justify-center items-start">
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                  }}
                  className="transition-transform duration-200 ease-in-out"
                >
                  <div ref={downloadResumeRef} style={styleVariables}>
                    <TemplateComponent resumeData={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 p-6 flex flex-col bg-background overflow-hidden">
            <div className="flex-grow overflow-y-auto hide-scrollbar">
              <Card>
                <CardHeader>
                  <CardTitle>Download Options</CardTitle>
                  <CardDescription>Choose your desired format.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={handleDownloadPdf} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download as PDF
                  </Button>
                  <Button onClick={() => handleDownloadImage('png')} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download as PNG
                  </Button>
                  <Button onClick={() => handleDownloadImage('jpeg')} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download as JPG
                  </Button>
                  <Button onClick={handleDownloadHtml} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download as HTML
                  </Button>
                </CardContent>
              </Card>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Zoom</h3>
                <Card className="rounded-full">
                  <CardContent className="p-2 flex items-center justify-around">
                    <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} aria-label="Zoom out">
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setZoom(zoom + 0.1)} aria-label="Zoom in">
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={fitToScreen} aria-label="Fit to screen">
                      <Minimize className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="mt-6 flex-shrink-0">
              <Button variant="outline" onClick={onClose} className="w-full">
                <X className="mr-2 h-4 w-4" /> Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;