import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { coverLetterTemplates } from '@/lib/coverletter-templates';
import { ArrowRight, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CoverLetterData } from '@/types/coverletter';
import { cn } from '@/lib/utils';
import { CoverLetterPreview } from '@/components/CoverLetterPreview';

interface CoverLetterPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string | null;
    onSelectTemplate: (templateId: string) => void;
}

const CoverLetterPreviewModal = ({ isOpen, onClose, templateId, onSelectTemplate }: CoverLetterPreviewModalProps) => {
    const [scale, setScale] = useState(0.8);
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

    const template = coverLetterTemplates[templateId];

    if (!template) return null;

    const sampleData: CoverLetterData = {
        id: 'sample',
        title: 'Sample Cover Letter',
        lastModified: Date.now(),
        recipient: {
            companyName: 'Acme Corp',
            hiringManagerName: 'Jane Smith',
            position: 'Senior Engineer',
            address: '123 Business Ave, Tech City, TC 90210',
        },
        sender: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            address: '456 Main St, Anytown, USA',
        },
        content: {
            opening: 'Dear Ms. Smith,\n\nI am writing to express my strong interest in the Senior Engineer position at Acme Corp. With over 5 years of experience in full-stack development and a passion for building scalable web applications, I am confident in my ability to contribute effectively to your engineering team.',
            body: 'In my current role at TechSolutions, I led the migration of a legacy monolith to a microservices architecture, improving system reliability by 40% and reducing deployment time by 60%. I have extensive experience with React, Node.js, and cloud technologies, which aligns perfectly with the requirements for this role.\n\nI am particularly drawn to Acme Corp\'s commitment to innovation and open-source contribution. I have been following your team\'s work on the new design system and would be thrilled to bring my expertise in UI/UX engineering to the table.',
            closing: 'Thank you for considering my application. I look forward to the possibility of discussing how my skills and experience can help Acme Corp achieve its goals.\n\nBest regards,',
        },
        templateId: templateId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

    const handleSelect = () => {
        if (templateId) {
            onSelectTemplate(templateId);
        }
        onClose();
    };

    const handleDownloadPdf = async () => {
        const element = downloadRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`${template.name.replace(' ', '_')}_Template.pdf`);
    };

    const handleDownloadImage = async (format: 'png' | 'jpeg') => {
        const element = downloadRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false });
        const imgData = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `${template.name.replace(' ', '_')}_Template.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Template Preview</DialogTitle>
                    <DialogDescription>Review the template and start writing your cover letter.</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-3 flex-grow min-h-0">
                    <div ref={previewContainerRef} className="md:col-span-2 bg-muted/50 p-8 overflow-y-auto hide-scrollbar">
                        <div className="flex justify-center items-start">
                            <div
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top center',
                                }}
                                className="transition-transform duration-200 shadow-lg"
                            >
                                <CoverLetterPreview
                                    data={sampleData}
                                    className="w-[210mm] min-h-[297mm] bg-white"
                                    showHoverEffect={false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-1 p-6 flex flex-col bg-background overflow-y-auto">
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{template.category}</p>
                            <p className="text-muted-foreground mb-6">
                                A professional design suitable for {template.category.toLowerCase()} applications. Fully customizable content and formatting.
                            </p>
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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                {/* Hidden div for high-quality downloads */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div ref={downloadRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white' }}>
                        <CoverLetterPreview
                            data={sampleData}
                            className="w-full h-full"
                            showHoverEffect={false}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CoverLetterPreviewModal;
