import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewSetup } from '@/components/InterviewSetup';
import { InterviewSetupData, InterviewQuestion, InterviewData, InterviewLanguage } from '@/types/interview';
import { generateInterviewQuestions } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Loader2, Share2, Heart } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { UserNav } from '@/components/UserNav';
import { getUserProfile, deductCredits } from '@/lib/user-service';
import { InsufficientCreditsDialog } from '@/components/InsufficientCreditsDialog';

const InterviewSetupPage = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCreditsDialog, setShowCreditsDialog] = useState(false);
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [nextResetDate, setNextResetDate] = useState<string>('');

    const REQUIRED_CREDITS = 5;

    useEffect(() => {
        if (user) {
            getUserProfile(user).then(profile => {
                setUserCredits(profile.credits);
                const lastReset = profile.lastCreditReset || profile.createdAt;
                const nextReset = new Date(lastReset + (30 * 24 * 60 * 60 * 1000));
                setNextResetDate(nextReset.toLocaleDateString());
            });
        }
    }, [user]);

    const checkCreditsAndStart = async (setupData: InterviewSetupData) => {
        if (!user) {
            toast({
                title: 'Authentication Required',
                description: 'Please sign in to start an interview.',
                variant: 'destructive'
            });
            return;
        }

        // Check if user has personal API key enabled
        const profile = await getUserProfile(user);
        const hasPersonalApiKey = profile.usePersonalApiKey && !!localStorage.getItem('gemini_api_key');

        // If using personal API key, skip credit check
        if (hasPersonalApiKey) {
            await startInterview(setupData);
            return;
        }

        // Check credits
        if (profile.credits < REQUIRED_CREDITS) {
            setShowCreditsDialog(true);
            return;
        }

        // Deduct credits immediately when starting the interview
        const didDeduct = await deductCredits(user.uid, REQUIRED_CREDITS);
        if (!didDeduct) {
            toast({
                title: 'Unable to Deduct Credits',
                description: 'Please try again or check your balance.',
                variant: 'destructive'
            });
            return;
        }
        setUserCredits((prev) => (prev !== null ? prev - REQUIRED_CREDITS : prev));

        // Credits deducted, start interview
        await startInterview(setupData);
    };

    const startInterview = async (setupData: InterviewSetupData) => {
        setIsGenerating(true);

        try {
            // Ensure language is always 'english' if not set or invalid
            const validLanguages: InterviewLanguage[] = ['english', 'hinglish', 'marathi', 'hindi'];
            const finalLanguage: InterviewLanguage = validLanguages.includes(setupData.language) ? setupData.language : 'english';

            // Generate AI questions
            const questions: InterviewQuestion[] = await generateInterviewQuestions(
                setupData.resumeText,
                setupData.jobRole,
                setupData.numQuestions,
                finalLanguage
            );

            // Initialize interview data with validated language
            const newInterviewData: InterviewData = {
                id: `interview-${Date.now()}`,
                userId: user?.uid,
                setupData: {
                    ...setupData,
                    language: finalLanguage
                },
                questions,
                responses: [],
                startTime: Date.now(),
                currentQuestionIndex: 0,
                status: 'in-progress'
            };

            // Navigate to the standalone interview session page with data
            navigate('/interview-session', { state: { interviewData: newInterviewData } });

            toast({
                title: 'Interview Started',
                description: `${questions.length} questions generated. Good luck!`
            });
        } catch (error: any) {
            console.error('Error generating questions:', error);
            toast({
                title: 'Failed to Generate Questions',
                description: error.message || 'Please try again.',
                variant: 'destructive'
            });
            setIsGenerating(false);
        }
    };

    const handleSetupComplete = async (setupData: InterviewSetupData) => {
        await checkCreditsAndStart(setupData);
    };

    if (isGenerating) {
        return (
            <div className="flex flex-col h-full bg-slate-50">
                <header className="bg-white border-b p-3 hidden md:block flex-shrink-0 no-print h-14">
                    <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
                        <h1 className="text-lg font-bold tracking-tight">Interview Coach</h1>
                        <div className="flex items-center gap-2">
                            <button
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'NeuCV - AI Resume Builder',
                                            text: 'Check out this amazing free AI Resume Builder!',
                                            url: window.location.origin
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(window.location.origin);
                                    }
                                }}
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                                        <Heart className="h-4 w-4 text-red-500" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Support the Project</h4>
                                            <p className="text-xs text-muted-foreground">Your contributions help keep this project free!</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-white p-3 rounded-lg border">
                                                <img src="/QR CODE.jpg" alt="UPI QR Code" className="w-32 h-32 object-contain" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="font-semibold text-sm">Vedant Wankhade</p>
                                                <p className="text-xs text-muted-foreground">UPI: 9175988560@kotak811</p>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <UserNav />
                        </div>
                    </div>
                </header>
                <div className="flex-grow flex items-center justify-center p-6">
                    <div className="p-8 text-center max-w-md">
                        <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">Preparing Your Interview</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Our AI is analyzing your resume and generating a tailored set of questions for your role.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white border-b p-3 hidden md:block flex-shrink-0 no-print h-14">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
                    <h1 className="text-lg font-bold tracking-tight">Interview Coach</h1>
                    <div className="flex items-center gap-2">
                        <button
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'NeuCV - AI Resume Builder',
                                        text: 'Check out this amazing free AI Resume Builder!',
                                        url: window.location.origin
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.origin);
                                }
                            }}
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                                    <Heart className="h-4 w-4 text-red-500" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Support the Project</h4>
                                        <p className="text-xs text-muted-foreground">Your contributions help keep this project free!</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="bg-white p-3 rounded-lg border">
                                            <img src="/QR CODE.jpg" alt="UPI QR Code" className="w-32 h-32 object-contain" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="font-semibold text-sm">Vedant Wankhade</p>
                                            <p className="text-xs text-muted-foreground">UPI: 9175988560@kotak811</p>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <UserNav />
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Start a New Session</h2>
                    <p className="text-muted-foreground mt-2">
                        Practice your interview skills with our AI-powered coach. Upload your resume to get started.
                    </p>
                </div>

                <InterviewSetup
                    onComplete={handleSetupComplete}
                    onCancel={() => navigate('/dashboard')}
                />
            </main>

            <InsufficientCreditsDialog
                open={showCreditsDialog}
                onOpenChange={setShowCreditsDialog}
                currentCredits={userCredits || 0}
                requiredCredits={REQUIRED_CREDITS}
                nextResetDate={nextResetDate}
            />
        </div>
    );
};

export default InterviewSetupPage;