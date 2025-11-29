import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Save, FileText } from 'lucide-react';
import { CoverLetterData } from '@/types/coverletter';
import { coverLetterTemplates } from '@/lib/coverletter-templates';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CoverLetterPreviewContainer from '@/components/CoverLetterPreviewContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ZoomControls from '@/components/ZoomControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileViewToggle } from '@/components/MobileViewToggle';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { saveCoverLetterToFirestore } from '@/lib/firestore-cover-letter-service';
import { getAutoSaveSettings } from '@/lib/settings';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateCoverLetterBody, generateCoverLetterOpening, generateCoverLetterClosing } from '@/lib/gemini';

export default function CoverLetterEditor() {
    const navigate = useNavigate();
    const { templateId, coverLetterId } = useParams();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [user] = useAuthState(auth);

    const [selectedTemplate, setSelectedTemplate] = useState(templateId || 'classic');
    const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
        id: coverLetterId || uuidv4(),
        title: 'Untitled Cover Letter',
        lastModified: Date.now(),
        recipient: {
            companyName: '',
            hiringManagerName: '',
            position: '',
            address: '',
        },
        sender: {
            name: '',
            email: '',
            phone: '',
            address: '',
        },
        content: {
            opening: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Position] role at [Company]. With my background and experience, I am confident I would be a valuable addition to your team.',
            body: 'In my previous role, I have demonstrated strong skills in [relevant skills/experience]. I am particularly excited about this opportunity because [reason why you\'re interested in the company/position].\n\nMy experience includes [key achievements or responsibilities that align with the job]. I believe these qualifications make me an excellent fit for this position.\n\nI am passionate about [relevant field/industry] and am eager to contribute to [company\'s mission or goals].',
            closing: 'Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with your team\'s needs. I am available for an interview at your convenience.\n\nBest regards,',
        },
        templateId: selectedTemplate,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    });

    const [zoom, setZoom] = useState(0.84);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [generatingSection, setGeneratingSection] = useState<'opening' | 'body' | 'closing' | null>(null);

    // Load existing cover letter if coverLetterId is provided
    useEffect(() => {
        const loadCoverLetter = async () => {
            if (coverLetterId && user) {
                try {
                    const { getCoverLetterFromFirestore } = await import('@/lib/firestore-cover-letter-service');
                    const existingLetter = await getCoverLetterFromFirestore(user.uid, coverLetterId);

                    if (existingLetter) {
                        setCoverLetterData(existingLetter);
                        setSelectedTemplate(existingLetter.templateId || templateId || 'classic');
                    } else {
                        console.error('Cover letter not found');
                        toast({
                            title: 'Error',
                            description: 'Cover letter not found',
                            variant: 'destructive',
                        });
                        navigate('/cover-letter-templates');
                    }
                } catch (error) {
                    console.error('Error loading cover letter:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to load cover letter',
                        variant: 'destructive',
                    });
                }
            }
        };

        loadCoverLetter();
    }, [coverLetterId, user, templateId, navigate, toast]);


    const fitToScreen = useCallback(() => {
        if (previewContainerRef.current) {
            const containerStyle = window.getComputedStyle(previewContainerRef.current);
            const paddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
            const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);
            const availableWidth = previewContainerRef.current.clientWidth - paddingX;
            const availableHeight = previewContainerRef.current.clientHeight - paddingY;

            // A4 dimensions in pixels at 96 DPI
            const contentWidth = 794;
            const contentHeight = 1123;

            if (contentWidth <= 0 || contentHeight <= 0) return;

            const scaleX = availableWidth / contentWidth;
            const scaleY = availableHeight / contentHeight;

            const margin = isMobile ? 0.92 : 0.95;
            const newScale = Math.min(scaleX, scaleY, 1) * margin;

            setZoom(newScale > 0 ? newScale : 1);
        }
    }, [isMobile]);

    useEffect(() => {
        const handleResize = () => setTimeout(fitToScreen, 50);
        if (isMobile) {
            handleResize();
        } else {
            setZoom(0.84);
        }
        const resizeObserver = new ResizeObserver(handleResize);
        const currentContainer = previewContainerRef.current;
        if (currentContainer) {
            resizeObserver.observe(currentContainer);
        }
        window.addEventListener('resize', handleResize);
        return () => {
            if (currentContainer) {
                resizeObserver.unobserve(currentContainer);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobile, fitToScreen, mobileView]);


    const handleInputChange = (section: 'recipient' | 'sender' | 'content', field: string, value: string) => {
        setCoverLetterData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    // Auto-save effect for cover letters
    useEffect(() => {
        if (coverLetterData && user) {
            const settings = getAutoSaveSettings();

            if (settings.coverLetterAutoSave) {
                const saveTimer = setTimeout(() => {
                    console.log('💾 Auto-saving cover letter...');
                    saveCoverLetterToFirestore(user.uid, coverLetterData);
                }, 1000); // Debounce save
                return () => clearTimeout(saveTimer);
            } else {
                console.log('⏸️ Cover letter auto-save is disabled');
            }
        }
    }, [coverLetterData, user]);

    const handleSave = async () => {
        if (user) {
            try {
                console.log('💾 Manually saving cover letter...');
                await saveCoverLetterToFirestore(user.uid, coverLetterData);
                toast({
                    title: 'Cover letter saved!',
                    description: 'Your cover letter has been saved to your account.',
                });
            } catch (error) {
                console.error("Error saving to Firestore", error);
                toast({
                    title: 'Error saving',
                    description: 'Failed to save cover letter to the database.',
                    variant: 'destructive',
                });
            }
        } else {
            // Fallback to local storage for guest users
            const existingLetters = JSON.parse(localStorage.getItem('coverLetters') || '[]');
            const updatedLetters = existingLetters.filter((l: CoverLetterData) => l.id !== coverLetterData.id);
            localStorage.setItem('coverLetters', JSON.stringify([...updatedLetters, coverLetterData]));

            toast({
                title: 'Cover letter saved!',
                description: 'Your cover letter has been saved locally.',
            });
        }
    };

    const handleDownload = async () => {
        const element = document.getElementById('pdf-target');
        if (!element) return;

        try {
            element.style.display = 'block';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            element.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`${coverLetterData.sender.name || 'CoverLetter'}_${coverLetterData.recipient.companyName || 'Application'}.pdf`);

            toast({
                title: 'Downloaded successfully!',
                description: 'Your cover letter has been downloaded as PDF.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Download failed',
                description: 'Failed to download cover letter. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleGenerateAllAIContent = async () => {
        if (!user) {
            toast({ 
                title: "Authentication Required", 
                description: "Please sign in to use AI features.", 
                variant: "destructive" 
            });
            return;
        }

        // Validate required fields
        if (!coverLetterData.recipient.position || !coverLetterData.recipient.companyName) {
            toast({ 
                title: "Missing Information", 
                description: "Please fill in the Position and Company Name fields before generating content.", 
                variant: "destructive" 
            });
            return;
        }

        setIsGeneratingAI(true);
        setGeneratingSection('opening'); // Start with opening

        try {
            // Try to fetch user's resume data for context
            let resumeData = null;
            try {
                const { getUserResumesFromFirestore } = await import('@/lib/firestore-service');
                const resumes = await getUserResumesFromFirestore(user.uid);
                if (resumes && resumes.length > 0) {
                    resumeData = resumes[0]; // Use the most recent resume
                }
            } catch (error) {
                console.log('Could not fetch resume data, proceeding without it');
            }

            const position = coverLetterData.recipient.position || '';
            const companyName = coverLetterData.recipient.companyName || '';

            // Generate all three sections sequentially
            setGeneratingSection('opening');
            const opening = await generateCoverLetterOpening(position, companyName, resumeData, coverLetterData);
            setCoverLetterData(prev => ({
                ...prev,
                content: { ...prev.content, opening }
            }));

            setGeneratingSection('body');
            const body = await generateCoverLetterBody(position, companyName, resumeData, coverLetterData);
            setCoverLetterData(prev => ({
                ...prev,
                content: { ...prev.content, body }
            }));

            setGeneratingSection('closing');
            const closing = await generateCoverLetterClosing(position, companyName, resumeData, coverLetterData);
            setCoverLetterData(prev => ({
                ...prev,
                content: { ...prev.content, closing }
            }));

            toast({ 
                title: "Cover Letter Generated", 
                description: "AI analyzed your information and generated a complete professional cover letter." 
            });
        } catch (error: any) {
            console.error('Error generating cover letter:', error);
            const errorMessage = error?.message || "Please check your API key.";
            toast({ 
                title: "Generation Failed", 
                description: errorMessage, 
                variant: "destructive" 
            });
        } finally {
            setIsGeneratingAI(false);
            setGeneratingSection(null);
        }
    };

    const TemplateComponent = coverLetterTemplates[selectedTemplate]?.component || coverLetterTemplates.classic.component;

    return (
        <div className="flex flex-col h-screen bg-muted">
            {/* Hidden PDF Target */}
            <div className="fixed left-[-9999px] top-0 overflow-hidden">
                <div id="pdf-target" style={{ width: '210mm', minHeight: '297mm', background: 'white' }}>
                    <TemplateComponent data={{ ...coverLetterData, templateId: selectedTemplate }} />
                </div>
            </div>

            <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-20 shadow-sm flex-shrink-0">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/cover-letter-templates')}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-border" />
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold leading-none">Cover Letter Editor</h1>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {coverLetterTemplates[selectedTemplate]?.name || 'Custom'} Template
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="flex items-center gap-3">
                            {getAutoSaveSettings().coverLetterAutoSave ? (
                                <Button variant="ghost" disabled className="hidden sm:flex text-muted-foreground">
                                    <Save className="w-4 h-4 mr-2" />
                                    Auto-Saved
                                </Button>
                            ) : (
                                <Button onClick={handleSave} variant="default" size="sm" className="hidden sm:flex shadow-md hover:shadow-lg transition-shadow">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Draft
                                </Button>
                            )}
                            <Button onClick={handleDownload} size="sm" className="shadow-md hover:shadow-lg transition-all">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0">
                {isMobile ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-grow overflow-y-auto hide-scrollbar pb-32">
                            {mobileView === 'form' ? (
                                <div className="bg-background h-full p-4">
                                    <EditorForm
                                        coverLetterData={coverLetterData}
                                        handleInputChange={handleInputChange}
                                        selectedTemplate={selectedTemplate}
                                        setSelectedTemplate={setSelectedTemplate}
                                        user={user}
                                        isGeneratingAI={isGeneratingAI}
                                        setIsGeneratingAI={setIsGeneratingAI}
                                        generatingSection={generatingSection}
                                        setGeneratingSection={setGeneratingSection}
                                        handleGenerateAllAIContent={handleGenerateAllAIContent}
                                    />
                                </div>
                            ) : (
                                <div className="bg-secondary h-full">
                                    <CoverLetterPreviewContainer
                                        data={{ ...coverLetterData, templateId: selectedTemplate }}
                                        templateId={selectedTemplate}
                                        zoom={zoom}
                                        containerRef={previewContainerRef}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="fixed bottom-4 left-4 right-4 z-50 no-print">
                            <MobileViewToggle view={mobileView} setView={setMobileView} />
                        </div>
                        {mobileView === 'preview' && (
                            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 no-print">
                                <ZoomControls zoom={zoom} setZoom={setZoom} fitToScreen={fitToScreen} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                        <div className="md:col-span-1 overflow-y-auto no-print bg-background hide-scrollbar m-4 rounded-2xl shadow-sm border p-6">
                            <EditorForm
                                coverLetterData={coverLetterData}
                                handleInputChange={handleInputChange}
                                selectedTemplate={selectedTemplate}
                                setSelectedTemplate={setSelectedTemplate}
                                user={user}
                                isGeneratingAI={isGeneratingAI}
                                setIsGeneratingAI={setIsGeneratingAI}
                                generatingSection={generatingSection}
                                setGeneratingSection={setGeneratingSection}
                                handleGenerateAllAIContent={handleGenerateAllAIContent}
                            />
                        </div>
                        <div className="md:col-span-1 bg-secondary overflow-hidden relative">
                            <CoverLetterPreviewContainer
                                data={{ ...coverLetterData, templateId: selectedTemplate }}
                                templateId={selectedTemplate}
                                zoom={zoom}
                                containerRef={previewContainerRef}
                            />
                            <ZoomControls zoom={zoom} setZoom={setZoom} fitToScreen={fitToScreen} className="absolute bottom-4 right-4" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function EditorForm({ coverLetterData, handleInputChange, selectedTemplate, setSelectedTemplate, user, isGeneratingAI, setIsGeneratingAI, generatingSection, setGeneratingSection, handleGenerateAllAIContent }: any) {
    const { toast } = useToast();

    const handleGenerateAIContent = async (section: 'opening' | 'body' | 'closing') => {
        if (!user) {
            toast({ 
                title: "Authentication Required", 
                description: "Please sign in to use AI features.", 
                variant: "destructive" 
            });
            return;
        }

        setIsGeneratingAI(true);
        setGeneratingSection(section);

        try {
            // Try to fetch user's resume data for context
            let resumeData = null;
            try {
                const { getUserResumesFromFirestore } = await import('@/lib/firestore-service');
                const resumes = await getUserResumesFromFirestore(user.uid);
                if (resumes && resumes.length > 0) {
                    resumeData = resumes[0]; // Use the most recent resume
                }
            } catch (error) {
                console.log('Could not fetch resume data, proceeding without it');
            }

            let generatedContent = '';
            
            if (section === 'opening') {
                generatedContent = await generateCoverLetterOpening(
                    coverLetterData.recipient.position || '',
                    coverLetterData.recipient.companyName || '',
                    resumeData,
                    coverLetterData
                );
            } else if (section === 'body') {
                generatedContent = await generateCoverLetterBody(
                    coverLetterData.recipient.position || '',
                    coverLetterData.recipient.companyName || '',
                    resumeData,
                    coverLetterData
                );
            } else {
                generatedContent = await generateCoverLetterClosing(
                    coverLetterData.recipient.position || '',
                    coverLetterData.recipient.companyName || '',
                    resumeData,
                    coverLetterData
                );
            }

            handleInputChange('content', section, generatedContent);
            toast({ 
                title: "Content Generated", 
                description: `AI analyzed your information and generated a professional ${section} section.` 
            });
        } catch (error: any) {
            console.error(`Error generating ${section}:`, error);
            const errorMessage = error?.message || "Please check your API key.";
            toast({ 
                title: "Generation Failed", 
                description: errorMessage, 
                variant: "destructive" 
            });
        } finally {
            setIsGeneratingAI(false);
            setGeneratingSection(null);
        }
    };

    return (
        <div className="space-y-8">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-3 p-1 bg-slate-100/80 backdrop-blur rounded-xl border border-slate-200/60 mb-8">
                    <TabsTrigger
                        value="details"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                    >
                        Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="content"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                    >
                        Content
                    </TabsTrigger>
                    <TabsTrigger
                        value="templates"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                    >
                        Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <Card className="border-0 shadow-md ring-1 ring-slate-200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Personal Details</CardTitle>
                            <CardDescription>Your contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                                <Input
                                    value={coverLetterData.sender.name}
                                    onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                                    <Input
                                        value={coverLetterData.sender.email}
                                        onChange={(e) => handleInputChange('sender', 'email', e.target.value)}
                                        placeholder="john@example.com"
                                        className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</Label>
                                    <Input
                                        value={coverLetterData.sender.phone}
                                        onChange={(e) => handleInputChange('sender', 'phone', e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</Label>
                                <Input
                                    value={coverLetterData.sender.address}
                                    onChange={(e) => handleInputChange('sender', 'address', e.target.value)}
                                    placeholder="City, State, Country"
                                    className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md ring-1 ring-slate-200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Recipient Details</CardTitle>
                            <CardDescription>Who are you writing to?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name</Label>
                                <Input
                                    value={coverLetterData.recipient.companyName}
                                    onChange={(e) => handleInputChange('recipient', 'companyName', e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Position</Label>
                                <Input
                                    value={coverLetterData.recipient.position}
                                    onChange={(e) => handleInputChange('recipient', 'position', e.target.value)}
                                    placeholder="e.g. Senior Developer"
                                    className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hiring Manager</Label>
                                    <Input
                                        value={coverLetterData.recipient.hiringManagerName}
                                        onChange={(e) => handleInputChange('recipient', 'hiringManagerName', e.target.value)}
                                        placeholder="Optional"
                                        className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Address</Label>
                                    <Input
                                        value={coverLetterData.recipient.address}
                                        onChange={(e) => handleInputChange('recipient', 'address', e.target.value)}
                                        placeholder="Optional"
                                        className="mt-1.5 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <Card className="border-0 shadow-md ring-1 ring-slate-200">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">Letter Content</CardTitle>
                                    <CardDescription>Craft your story</CardDescription>
                                </div>
                                <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={handleGenerateAllAIContent} 
                                    disabled={isGeneratingAI}
                                    className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                                >
                                    {isGeneratingAI ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Opening</Label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleGenerateAIContent('opening')} 
                                        disabled={isGeneratingAI}
                                        className="text-xs gap-2 h-7"
                                    >
                                        {isGeneratingAI && generatingSection === 'opening' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-purple-500" />
                                        )}
                                        Generate with AI
                                    </Button>
                                </div>
                                <Textarea
                                    value={coverLetterData.content.opening}
                                    onChange={(e) => handleInputChange('content', 'opening', e.target.value)}
                                    rows={4}
                                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors leading-relaxed"
                                    placeholder="Introduce yourself and the position you're applying for..."
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Body</Label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleGenerateAIContent('body')} 
                                        disabled={isGeneratingAI}
                                        className="text-xs gap-2 h-7"
                                    >
                                        {isGeneratingAI && generatingSection === 'body' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-purple-500" />
                                        )}
                                        Generate with AI
                                    </Button>
                                </div>
                                <Textarea
                                    value={coverLetterData.content.body}
                                    onChange={(e) => handleInputChange('content', 'body', e.target.value)}
                                    rows={12}
                                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors leading-relaxed"
                                    placeholder="Detail your experience and why you're a great fit..."
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Closing</Label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleGenerateAIContent('closing')} 
                                        disabled={isGeneratingAI}
                                        className="text-xs gap-2 h-7"
                                    >
                                        {isGeneratingAI && generatingSection === 'closing' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-purple-500" />
                                        )}
                                        Generate with AI
                                    </Button>
                                </div>
                                <Textarea
                                    value={coverLetterData.content.closing}
                                    onChange={(e) => handleInputChange('content', 'closing', e.target.value)}
                                    rows={4}
                                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors leading-relaxed"
                                    placeholder="Thank them and request an interview..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <Card className="border-0 shadow-md ring-1 ring-slate-200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Choose Template</CardTitle>
                            <CardDescription>Select a design that fits your style</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(coverLetterTemplates).map(([id, template]) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedTemplate(id)}
                                        className={`
                                            group relative flex flex-col items-center gap-3 p-3 rounded-xl transition-all duration-200 border-2
                                            ${selectedTemplate === id
                                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                                : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className="w-full aspect-[210/297] bg-white border rounded-lg shadow-sm overflow-hidden relative group-hover:shadow-md transition-shadow">
                                            <div className={`absolute inset-0 opacity-50 ${id === 'modern' ? 'bg-blue-100' : id === 'creative' ? 'bg-purple-100' : id === 'minimalist' ? 'bg-gray-100' : 'bg-slate-50'}`} />
                                            {/* Preview placeholder or mini-preview could go here */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                                                <span className="bg-white/90 text-xs font-medium px-2 py-1 rounded-full shadow-sm text-slate-700">Select</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${selectedTemplate === id ? 'text-primary' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                {template.name}
                                            </span>
                                            {selectedTemplate === id && (
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
