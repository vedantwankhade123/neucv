import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewSetup } from '@/components/InterviewSetup';
import { InterviewSetupData, InterviewQuestion, InterviewData } from '@/types/interview';
import { generateInterviewQuestions } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const InterviewSetupPage = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSetupComplete = async (setupData: InterviewSetupData) => {
        setIsGenerating(true);

        try {
            // Generate AI questions
            const questions: InterviewQuestion[] = await generateInterviewQuestions(
                setupData.resumeText,
                setupData.jobRole,
                setupData.numQuestions,
                setupData.language
            );

            // Initialize interview data
            const newInterviewData: InterviewData = {
                id: `interview-${Date.now()}`,
                userId: user?.uid,
                setupData,
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

    if (isGenerating) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Card className="p-8 text-center max-w-md shadow-lg border-none bg-white">
                    <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900">Preparing Your Interview</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Our AI is analyzing your resume and generating a tailored set of questions for your role.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Interview Coach</h1>
                    <p className="text-muted-foreground mt-2">
                        Practice your interview skills with our AI-powered coach. Upload your resume to get started.
                    </p>
                </div>
                
                <InterviewSetup
                    onComplete={handleSetupComplete}
                    onCancel={() => navigate('/dashboard')}
                />
            </div>
        </div>
    );
};

export default InterviewSetupPage;