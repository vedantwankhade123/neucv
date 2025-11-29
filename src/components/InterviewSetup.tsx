import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InterviewSetupData, InterviewLanguage, InterviewDuration, InterviewQuestionCount } from '@/types/interview';
import { parseResumePDF, validateResumeFile, getLanguageDisplayName } from '@/lib/interview-service';
import { useToast } from '@/hooks/use-toast';
import { UserNav } from '@/components/UserNav';
import { Logo } from '@/components/Logo';

interface InterviewSetupProps {
    onComplete: (setupData: InterviewSetupData) => void;
    onCancel: () => void;
}

export function InterviewSetup({ onComplete, onCancel }: InterviewSetupProps) {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [duration, setDuration] = useState<InterviewDuration>(30);
    const [numQuestions, setNumQuestions] = useState<InterviewQuestionCount>(10);
    const [language, setLanguage] = useState<InterviewLanguage>('english');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateResumeFile(file);
        if (!validation.valid) {
            toast({
                title: 'Invalid File',
                description: validation.error,
                variant: 'destructive'
            });
            return;
        }

        setIsProcessing(true);
        try {
            const text = await parseResumePDF(file);
            console.log('PDF parsed successfully, text length:', text?.length || 0);
            console.log('Text preview:', text?.substring(0, 100));
            
            // Always set the file, even if text extraction fails
            setResumeFile(file);
            
            if (!text || text.trim().length === 0) {
                // PDF is likely image-based (scanned), but we'll still allow proceeding
                setResumeText('');
                console.warn('PDF appears to be image-based - no text extracted');
                toast({
                    title: 'Resume Uploaded',
                    description: 'PDF uploaded successfully. Note: This appears to be an image-based PDF. You can still proceed to enter your job role.',
                    variant: 'default'
                });
            } else {
                setResumeText(text);
                console.log('State updated - resumeFile:', !!file, 'resumeText:', !!text, 'textLength:', text.length);
                toast({
                    title: 'Resume Uploaded',
                    description: 'Your resume has been successfully processed.'
                });
            }
            
            // Force a re-render check
            setTimeout(() => {
                console.log('After state update - canProceedFromStep1:', !!file);
            }, 100);
        } catch (error: any) {
            console.error('PDF parsing error:', error);
            // Even if parsing fails, allow the file to be set so user can proceed
            setResumeFile(file);
            setResumeText('');
            toast({
                title: 'Resume Uploaded',
                description: 'PDF uploaded. Note: Text extraction failed (image-based PDF). You can still proceed.',
                variant: 'default'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const syntheticEvent = {
                target: { files: [file] }
            } as any;
            await handleFileChange(syntheticEvent);
        }
    };

    // Allow proceeding if file is uploaded, even if text extraction failed (for image-based PDFs)
    const canProceedFromStep1 = !!resumeFile;
    const canProceedFromStep2 = jobRole.trim().length > 0;
    
    // Debug logging - only log when values change
    useEffect(() => {
        console.log('Step validation updated:', {
            currentStep,
            canProceedFromStep1,
            canProceedFromStep2,
            hasResumeFile: !!resumeFile,
            hasResumeText: !!resumeText,
            resumeTextLength: resumeText?.length || 0,
            resumeFileName: resumeFile?.name,
            jobRole: jobRole.trim()
        });
    }, [currentStep, canProceedFromStep1, canProceedFromStep2, resumeFile, resumeText, jobRole]);

    const handleComplete = () => {
        if (!resumeFile || !jobRole.trim()) {
            toast({
                title: 'Incomplete Setup',
                description: 'Please upload a resume and enter a job role.',
                variant: 'destructive'
            });
            return;
        }

        // If resumeText is empty (image-based PDF), use a placeholder or the file name
        const finalResumeText = resumeText.trim() || `Resume file: ${resumeFile.name}. This appears to be an image-based PDF.`;

        onComplete({
            resumeFile,
            resumeText: finalResumeText,
            jobRole: jobRole.trim(),
            duration,
            numQuestions,
            language
        });
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b p-3 flex items-center justify-between flex-shrink-0 no-print h-14">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900">Interview Coach</h1>
                        <p className="text-xs text-muted-foreground">Configure your practice session</p>
                    </div>
                </div>
                <UserNav />
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-3 overflow-y-auto overflow-x-hidden">
                <Card className="w-full max-w-2xl shadow-lg bg-white">
                    <CardHeader className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <CardTitle className="text-xl text-slate-900">Setup Your Interview</CardTitle>
                                <CardDescription className="text-xs">Step {currentStep} of 3</CardDescription>
                            </div>
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map((step) => (
                                    <div
                                        key={step}
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all text-xs",
                                            currentStep === step
                                                ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                                                : currentStep > step
                                                    ? "bg-green-500 text-white"
                                                    : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {currentStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-4">
                        {/* Step 1: Resume Upload */}
                        {currentStep === 1 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right duration-300">
                                <div>
                                    <h3 className="text-base font-semibold mb-1.5">Step 1: Upload Your Resume</h3>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Upload your resume in PDF format. We'll use it to generate personalized interview questions.
                                    </p>
                                </div>

                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
                                        resumeFile
                                            ? "border-green-500 bg-green-50"
                                            : "border-muted-foreground/25 hover:border-primary hover:bg-muted"
                                    )}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="resume-upload"
                                        disabled={isProcessing}
                                    />
                                    <label htmlFor="resume-upload" className="cursor-pointer">
                                        {isProcessing ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                                <p className="text-xs text-muted-foreground">Processing resume...</p>
                                            </div>
                                        ) : resumeFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-green-700">{resumeFile.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {(resumeFile.size / 1024).toFixed(0)} KB • Click to change
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Upload className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">Drop your resume here or click to browse</p>
                                                    <p className="text-xs text-muted-foreground mt-1">PDF format, max 10MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {resumeText && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <FileText className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs font-medium">Resume Preview</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{resumeText}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Job Role */}
                        {currentStep === 2 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right duration-300">
                                <div>
                                    <h3 className="text-base font-semibold mb-1.5">Step 2: Job Role</h3>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Enter the job role you're preparing for. This helps us tailor the interview questions.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="job-role" className="text-sm">Job Role / Position</Label>
                                    <Input
                                        id="job-role"
                                        placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Be specific to get more relevant questions
                                    </p>
                                </div>

                                {jobRole && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs text-blue-900">
                                            Great! We'll prepare interview questions for a <strong>{jobRole}</strong> position.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Interview Settings */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                                <div>
                                    <h3 className="text-base font-semibold mb-1.5">Step 3: Interview Settings</h3>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Configure your interview preferences
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Interview Duration</Label>
                                        <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as InterviewDuration)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Number of Questions</Label>
                                        <Select value={numQuestions.toString()} onValueChange={(v) => setNumQuestions(parseInt(v) as InterviewQuestionCount)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5 questions</SelectItem>
                                                <SelectItem value="10">10 questions</SelectItem>
                                                <SelectItem value="15">15 questions</SelectItem>
                                                <SelectItem value="20">20 questions</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm">Interview Language</Label>
                                    <Select value={language} onValueChange={(v) => setLanguage(v as InterviewLanguage)}>
                                        <SelectTrigger className="text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="hinglish">Hinglish (Hindi + English)</SelectItem>
                                            <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                                            <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Questions and feedback will be in {getLanguageDisplayName(language)}
                                    </p>
                                </div>

                                <Card className="bg-muted">
                                    <CardContent className="p-3">
                                        <h4 className="font-medium mb-2 text-sm">Interview Summary</h4>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Job Role:</span>
                                                <span className="font-medium">{jobRole}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="font-medium">{duration} minutes</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Questions:</span>
                                                <span className="font-medium">{numQuestions}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Language:</span>
                                                <span className="font-medium">{getLanguageDisplayName(language)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (currentStep === 1) {
                                        onCancel();
                                    } else {
                                        setCurrentStep(currentStep - 1);
                                    }
                                }}
                                className="text-xs h-8"
                            >
                                <ArrowLeft className="mr-2 h-3 w-3" />
                                {currentStep === 1 ? 'Cancel' : 'Back'}
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Next button clicked, currentStep:', currentStep);
                                    console.log('Validation state:', { canProceedFromStep1, canProceedFromStep2 });
                                    
                                    if (currentStep === 3) {
                                        handleComplete();
                                    } else if (currentStep === 1 && canProceedFromStep1) {
                                        console.log('Moving from step 1 to step 2');
                                        setCurrentStep(2);
                                    } else if (currentStep === 2 && canProceedFromStep2) {
                                        console.log('Moving from step 2 to step 3');
                                        setCurrentStep(3);
                                    } else {
                                        console.warn('Button clicked but validation failed');
                                    }
                                }}
                                disabled={
                                    (currentStep === 1 && !canProceedFromStep1) ||
                                    (currentStep === 2 && !canProceedFromStep2)
                                }
                                className="text-xs h-8 relative z-10 cursor-pointer"
                            >
                                {currentStep === 3 ? 'Start Interview' : 'Next'}
                                {currentStep !== 3 && <ArrowRight className="ml-2 h-3 w-3" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
