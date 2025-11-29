import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resumeTemplates } from '@/lib/resume-templates';
import { previewDataMap } from '@/data/previewData';
import { initialResumeStyle } from '@/data/initialData';
import { ArrowRight, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { themes } from '@/data/themes';
import { ResumeStyle } from '@/types/resume';
import { cn } from '@/lib/utils';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
  onSelectTemplate: (templateId: string, styles?: ResumeStyle) => void;
}

const TemplatePreviewModal = ({ isOpen, onClose, templateId, onSelectTemplate }: TemplatePreviewModalProps) => {
  const [scale, setScale] = useState(0.8);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(themes[0].id);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        const a4WidthPx = 794; // A4 width in pixels at 96 DPI

        const newScale = (containerWidth / a4WidthPx) * 0.9;

        setScale(Math.min(newScale, 1));
      }
    };

    if (isOpen) {
      const timer = setTimeout(calculateScale, 100);
      window.addEventListener('resize', calculateScale);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculateScale);
      };
    }
  }, [isOpen]);

  if (!templateId) return null;

  const template = resumeTemplates[templateId];
  const previewData = previewDataMap[templateId];
  const TemplateComponent = template?.component;

  if (!template || !previewData || !TemplateComponent) return null;

  const selectedTheme = themes.find(t => t.id === selectedThemeId) || themes[0];

  const handleSelect = () => {
    if (templateId) {
      // Create a full style object by merging initial styles with theme styles
      const styles: ResumeStyle = {
        ...initialResumeStyle,
        ...selectedTheme.styles
      };
      onSelectTemplate(templateId, styles);
    }
    onClose();
  };

  const handleDownloadPdf = async () => {
    const resumeElement = downloadRef.current;
    if (!resumeElement) return;

    const canvas = await html2canvas(resumeElement, { scale: 3, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`${template.name.replace(' ', '_')}_Template.pdf`);
  };

  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const resumeElement = downloadRef.current;
    if (!resumeElement) return;

    const canvas = await html2canvas(resumeElement, { scale: 3, useCORS: true, logging: false });
    const imgData = canvas.toDataURL(`image/${format}`);
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `${template.name.replace(' ', '_')}_Template.${format === 'jpeg' ? 'jpg' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadHtml = () => {
    const resumeElement = downloadRef.current;
    if (!resumeElement) return;

    const htmlContent = resumeElement.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${template.name} Template</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div style="width: 210mm; min-height: 297mm;">${htmlContent}</div>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(' ', '_')}_Template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const styleVariables = {
    '--font-family': selectedTheme.styles.fontFamily || initialResumeStyle.fontFamily,
    '--font-size-base': selectedTheme.styles.fontSize || initialResumeStyle.fontSize,
    '--heading-font-size': selectedTheme.styles.headingFontSize || initialResumeStyle.headingFontSize,
    '--accent-color': selectedTheme.styles.accentColor || initialResumeStyle.accentColor,
    '--section-spacing': selectedTheme.styles.sectionSpacing || initialResumeStyle.sectionSpacing,
    '--page-margins': selectedTheme.styles.pageMargins || initialResumeStyle.pageMargins,
    '--primary-background-color': selectedTheme.styles.primaryBackgroundColor || initialResumeStyle.primaryBackgroundColor,
    '--secondary-background-color': selectedTheme.styles.secondaryBackgroundColor || initialResumeStyle.secondaryBackgroundColor,
    '--primary-font-color': selectedTheme.styles.primaryFontColor || initialResumeStyle.primaryFontColor,
    '--secondary-font-color': selectedTheme.styles.secondaryFontColor || initialResumeStyle.secondaryFontColor,
  } as React.CSSProperties;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Template Preview</DialogTitle>
          <DialogDescription>Review the template and start building your resume.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 flex-grow min-h-0">
          <div ref={previewContainerRef} className="md:col-span-2 bg-muted/50 p-8 overflow-y-auto hide-scrollbar">
            <div className="flex justify-center items-start">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                }}
                className="transition-transform duration-200"
              >
                <div style={styleVariables}>
                  <TemplateComponent resumeData={previewData} />
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-1 p-6 flex flex-col bg-background overflow-y-auto">
            <div className="flex-grow">
              <h3 className="text-2xl font-bold">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.category}</p>
              <p className="text-muted-foreground mb-6">
                A professional and clean design, perfect for making a great first impression. This template is fully customizable in the editor.
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Select Theme</h4>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                        selectedThemeId === theme.id ? "ring-2 ring-primary border-primary bg-accent" : "hover:bg-accent/50"
                      )}
                    >
                      <div
                        className="w-full h-8 rounded-md border shadow-sm"
                        style={{ backgroundColor: theme.previewColor }}
                      />
                      <span className="text-xs font-medium text-center truncate w-full">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-auto">
              <Button onClick={handleSelect} size="lg" className="w-full">
                Use This Template <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Template
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem onClick={handleDownloadPdf}>PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadImage('png')}>PNG</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadImage('jpeg')}>JPG</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadHtml}>HTML</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Hidden div for high-quality downloads */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={downloadRef} style={styleVariables}>
            <TemplateComponent resumeData={previewData} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;