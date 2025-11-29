import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ResumeUploader from '@/components/ResumeUploader';
import ParsedResumeEditor from '@/components/ParsedResumeEditor';
import TemplateSelector from '@/components/TemplateSelector';
import { parseResumeFile, convertParsedDataToResume } from '@/lib/resume-parser';
import { ResumeData } from '@/types/resume';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

type ImportStep = 'upload' | 'edit' | 'template';

export default function Import() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<any>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);
        try {
            toast({
                title: 'Processing resume...',
                description: 'This may take a few moments.',
            });

            const parsed = await parseResumeFile(file);
            setParsedData(parsed);
            setCurrentStep('edit');

            toast({
                title: 'Resume parsed successfully!',
                description: 'Please review and edit the extracted information.',
            });
        } catch (error) {
            console.error('Parsing error:', error);
            toast({
                title: 'Parsing failed',
                description: error instanceof Error ? error.message : 'Failed to parse resume. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveAndContinue = (editedData: any) => {
        setParsedData(editedData);
        setCurrentStep('template');
    };

    const handleBackToUpload = () => {
        setCurrentStep('upload');
        setParsedData(null);
    };

    const handleBackToEdit = () => {
        setCurrentStep('edit');
    };

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplate(templateId);
    };

    const handleCreateResume = async () => {
        if (!parsedData) return;

        setIsProcessing(true);
        try {
            const resumeDataPartial = convertParsedDataToResume(parsedData);

            const newResume: ResumeData = {
                ...resumeDataPartial,
                id: uuidv4(),
                userId: user?.uid || undefined,
                title: `Imported Resume - ${parsedData.personalInfo.name || 'Untitled'}`,
                templateId: selectedTemplate,
                lastModified: Date.now(),
            } as ResumeData;

            if (user?.uid) {
                // Save to Firestore
                await addDoc(collection(db, 'resumes'), {
                    ...newResume,
                    userId: user.uid,
                });
            } else {
                // Save to localStorage if not logged in
                const existingResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
                localStorage.setItem('resumes', JSON.stringify([...existingResumes, newResume]));
            }

            toast({
                title: 'Resume created!',
                description: 'Your imported resume has been created successfully.',
            });

            // Navigate to editor
            navigate(`/editor/${newResume.id}`);
        } catch (error) {
            console.error('Error creating resume:', error);
            toast({
                title: 'Failed to create resume',
                description: 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>

                        <div className="flex items-center space-x-2">
                            <FileUp className="w-5 h-5 text-primary" />
                            <h1 className="text-2xl font-bold">Import Resume</h1>
                        </div>

                        <div className="w-32" /> {/* Spacer for centering */}
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="border-b bg-muted/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center space-x-4">
                        <StepIndicator
                            number={1}
                            label="Upload"
                            isActive={currentStep === 'upload'}
                            isCompleted={currentStep !== 'upload'}
                        />
                        <StepConnector isCompleted={currentStep !== 'upload'} />
                        <StepIndicator
                            number={2}
                            label="Review & Edit"
                            isActive={currentStep === 'edit'}
                            isCompleted={currentStep === 'template'}
                        />
                        <StepConnector isCompleted={currentStep === 'template'} />
                        <StepIndicator
                            number={3}
                            label="Choose Template"
                            isActive={currentStep === 'template'}
                            isCompleted={false}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                {currentStep === 'upload' && (
                    <div className="space-y-8">
                        <div className="max-w-2xl mx-auto text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold">Import Your Existing Resume</h2>
                            <p className="text-muted-foreground text-lg">
                                Upload your current resume and we'll intelligently extract all the information to get you started quickly.
                            </p>
                        </div>

                        <ResumeUploader
                            onFileSelect={handleFileSelect}
                            isProcessing={isProcessing}
                        />
                    </div>
                )}

                {currentStep === 'edit' && parsedData && (
                    <ParsedResumeEditor
                        parsedData={parsedData}
                        onSaveAndContinue={handleSaveAndContinue}
                        onBack={handleBackToUpload}
                    />
                )}

                {currentStep === 'template' && (
                    <div className="space-y-8">
                        <div className="max-w-2xl mx-auto text-center space-y-2">
                            <h2 className="text-3xl font-bold">Choose Your Template</h2>
                            <p className="text-muted-foreground">
                                Select a template that best represents your professional style
                            </p>
                        </div>

                        <TemplateSelector
                            onSelectTemplate={handleTemplateSelect}
                        />

                        <div className="flex justify-between sticky bottom-0 bg-background py-4 border-t max-w-5xl mx-auto">
                            <Button variant="outline" onClick={handleBackToEdit}>
                                Back to Edit
                            </Button>
                            <Button
                                onClick={handleCreateResume}
                                size="lg"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Creating Resume...' : 'Create Resume'}
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Step Indicator Component
function StepIndicator({
    number,
    label,
    isActive,
    isCompleted,
}: {
    number: number;
    label: string;
    isActive: boolean;
    isCompleted: boolean;
}) {
    return (
        <div className="flex flex-col items-center space-y-2">
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : 'bg-muted text-muted-foreground'
                    }`}
            >
                {isCompleted ? '✓' : number}
            </div>
            <span
                className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
            >
                {label}
            </span>
        </div>
    );
}

// Connector Line Component
function StepConnector({ isCompleted }: { isCompleted: boolean }) {
    return (
        <div
            className={`h-0.5 w-16 sm:w-24 transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted'
                }`}
        />
    );
}
