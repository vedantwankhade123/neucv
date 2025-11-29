import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Square, Volume2, VolumeX, Loader2, CheckCircle2, Timer, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { InterviewSetup } from '@/components/InterviewSetup';
import { InterviewReport } from '@/components/InterviewReport';
import { InterviewData, InterviewQuestion, InterviewResponse, InterviewSetupData } from '@/types/interview';
import { generateInterviewQuestions, evaluateInterviewResponse, generateInterviewReport } from '@/lib/gemini';
import { calculatePerformanceScore, formatDuration } from '@/lib/interview-service';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { UserNav } from '@/components/UserNav';

type InterviewPhase = 'setup' | 'interview' | 'report';

const InterviewCoach = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerIntervalRef = useRef<number | null>(null);

    // Phase management
    const [phase, setPhase] = useState<InterviewPhase>('setup');
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

    // Media controls
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    // Interview state
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Start/stop video stream
    const toggleVideo = async () => {
        if (!isVideoOn) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setIsVideoOn(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                toast({
                    title: 'Camera Access Denied',
                    description: 'Please allow camera access to use video features.',
                    variant: 'destructive'
                });
            }
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            setIsVideoOn(false);
        }
    };

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !isAudioOn;
            });
        }
        setIsAudioOn(!isAudioOn);
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
    };

    // Setup completion handler
    const handleSetupComplete = async (setupData: InterviewSetupData) => {
        setIsGeneratingQuestions(true);

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

            setInterviewData(newInterviewData);
            setCurrentQuestionIndex(0);
            setQuestionStartTime(Date.now());
            setPhase('interview');

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
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    // Submit answer handler
    const handleSubmitAnswer = async () => {
        if (!interviewData || !currentAnswer.trim()) {
            toast({
                title: 'No Answer Provided',
                description: 'Please type your answer before submitting.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmittingAnswer(true);

        try {
            const currentQuestion = interviewData.questions[currentQuestionIndex];
            const questionDuration = Math.floor((Date.now() - questionStartTime) / 1000);

            // Evaluate the answer using AI
            const evaluation = await evaluateInterviewResponse(
                currentQuestion.question,
                currentAnswer,
                interviewData.setupData.language
            );

            // Create response object
            const response: InterviewResponse = {
                questionId: currentQuestion.id,
                answer: currentAnswer,
                timestamp: Date.now(),
                duration: questionDuration,
                evaluation
            };

            // Update interview data
            const updatedResponses = [...interviewData.responses, response];
            const updatedData = {
                ...interviewData,
                responses: updatedResponses,
                currentQuestionIndex: currentQuestionIndex + 1
            };

            setInterviewData(updatedData);

            // Check if interview is complete
            if (currentQuestionIndex + 1 >= interviewData.questions.length) {
                await completeInterview(updatedData);
            } else {
                // Move to next question
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentAnswer('');
                setQuestionStartTime(Date.now());

                toast({
                    title: 'Answer Submitted',
                    description: `Score: ${evaluation.score}/100`
                });
            }
        } catch (error: any) {
            console.error('Error submitting answer:', error);
            toast({
                title: 'Submission Failed',
                description: error.message || 'Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmittingAnswer(false);
        }
    };

    // Complete interview and generate report
    const completeInterview = async (finalData: InterviewData) => {
        setIsGeneratingReport(true);

        try {
            const report = await generateInterviewReport(finalData);
            const completedData: InterviewData = {
                ...finalData,
                endTime: Date.now(),
                status: 'completed',
                report
            };

            setInterviewData(completedData);
            setPhase('report');

            toast({
                title: 'Interview Complete!',
                description: `Your score: ${report.overallScore}/100`
            });
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast({
                title: 'Report Generation Failed',
                description: 'Showing results without AI report.',
                variant: 'destructive'
            });

            // Fallback: show report without AI-generated content
            const fallbackReport = {
                overallScore: calculatePerformanceScore(finalData.responses),
                strengths: ['Completed the interview'],
                areasForImprovement: ['Report generation failed'],
                recommendations: ['Try again later'],
                performanceByCategory: []
            };

            setInterviewData({
                ...finalData,
                endTime: Date.now(),
                status: 'completed',
                report: fallbackReport
            });
            setPhase('report');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Timer for elapsed time
    useEffect(() => {
        if (phase === 'interview' && interviewData) {
            timerIntervalRef.current = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - interviewData.startTime) / 1000);
                setElapsedTime(elapsed);

                // Check if time limit is reached
                const timeLimit = interviewData.setupData.duration * 60;
                if (elapsed >= timeLimit) {
                    handleTimeUp();
                }
            }, 1000);

            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
            };
        }
    }, [phase, interviewData]);

    const handleTimeUp = () => {
        toast({
            title: 'Time Up!',
            description: 'Interview time limit reached.',
            variant: 'destructive'
        });
        if (interviewData) {
            completeInterview(interviewData);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [stream]);

    // Render based on phase
    if (phase === 'setup') {
        if (isGeneratingQuestions) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <Card className="p-6 text-center max-w-md">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary" />
                        <h2 className="text-lg font-semibold mb-2">Generating Interview Questions...</h2>
                        <p className="text-muted-foreground text-sm">
                            Our AI is creating personalized questions based on your resume and job role.
                        </p>
                    </Card>
                </div>
            );
        }

        return (
            <InterviewSetup
                onComplete={handleSetupComplete}
                onCancel={() => navigate('/dashboard')}
            />
        );
    }

    if (phase === 'report' && interviewData) {
        return (
            <InterviewReport
                interviewData={interviewData}
                onNewInterview={() => {
                    setPhase('setup');
                    setInterviewData(null);
                    setCurrentQuestionIndex(0);
                    setCurrentAnswer('');
                    setElapsedTime(0);
                }}
                onBackToDashboard={() => navigate('/dashboard')}
            />
        );
    }

    // Interview phase
    if (!interviewData) return null;

    const currentQuestion = interviewData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100;
    const timeLimit = interviewData.setupData.duration * 60;
    const timeRemaining = timeLimit - elapsedTime;

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                                    navigate('/dashboard');
                                }
                            }}
                            className="rounded-full h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">Interview Coach</h1>
                            <p className="text-xs text-muted-foreground">{interviewData.setupData.jobRole}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                            <Timer className="h-3 w-3 text-foreground" />
                            <span className={cn(
                                "font-mono font-semibold text-xs",
                                timeRemaining < 60 ? "text-destructive" : "text-foreground"
                            )}>
                                {formatDuration(timeRemaining)}
                            </span>
                        </div>
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto overflow-x-hidden p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium">
                                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
                            </span>
                            <span className="text-xs text-muted-foreground">{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Video Panel */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Current Question */}
                            <Card className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-medium">
                                        {currentQuestion.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-medium">
                                        {currentQuestion.difficulty}
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>
                            </Card>

                            {/* Answer Input */}
                            <Card className="p-4">
                                <h3 className="font-semibold mb-2 text-sm">Your Answer</h3>
                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="min-h-[150px] mb-3 text-sm"
                                    disabled={isSubmittingAnswer}
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                        {currentAnswer.length} characters
                                    </span>
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isSubmittingAnswer}
                                        size="sm"
                                        className="text-xs h-8"
                                    >
                                        {isSubmittingAnswer ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Evaluating...
                                            </>
                                        ) : currentQuestionIndex === interviewData.questions.length - 1 ? (
                                            <>
                                                Finish Interview
                                                <CheckCircle2 className="ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                Next Question
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>

                            {/* Video Preview */}
                            <Card className="relative overflow-hidden bg-slate-900 aspect-video rounded-2xl">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={cn(
                                        "w-full h-full object-cover",
                                        !isVideoOn && "hidden"
                                    )}
                                />
                                {!isVideoOn && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-3 mx-auto">
                                                <VideoOff className="h-10 w-10" />
                                            </div>
                                            <p className="text-slate-400">Camera is off</p>
                                        </div>
                                    </div>
                                )}

                                {/* Video Controls */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                                    <Button
                                        onClick={toggleVideo}
                                        size="icon"
                                        className={cn(
                                            "w-12 h-12 rounded-full shadow-lg",
                                            isVideoOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
                                        )}
                                    >
                                        {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                    </Button>

                                    <Button
                                        onClick={toggleAudio}
                                        size="icon"
                                        className={cn(
                                            "w-12 h-12 rounded-full shadow-lg",
                                            isAudioOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
                                        )}
                                    >
                                        {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                    </Button>

                                    <Button
                                        onClick={toggleSpeaker}
                                        size="icon"
                                        className={cn(
                                            "w-12 h-12 rounded-full shadow-lg",
                                            isSpeakerOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
                                        )}
                                    >
                                        {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Question List Panel */}
                        <div className="space-y-3">
                            <Card className="p-3">
                                <h3 className="font-semibold mb-3 text-sm">All Questions</h3>
                                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                                    {interviewData.questions.map((q, index) => {
                                        const isAnswered = interviewData.responses.some(r => r.questionId === q.id);
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <div
                                                key={q.id}
                                                className={cn(
                                                    "p-3 rounded-lg border-2 transition-all",
                                                    isCurrent && "border-primary bg-primary/5",
                                                    !isCurrent && isAnswered && "border-green-500 bg-green-50 dark:bg-green-950",
                                                    !isCurrent && !isAnswered && "border-border"
                                                )}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0",
                                                        isAnswered ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {isAnswered ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-xs font-medium line-clamp-2",
                                                            isCurrent && "text-primary"
                                                        )}>
                                                            {q.question}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Loading Overlay */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="p-8 text-center max-w-md">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                        <h2 className="text-xl font-semibold mb-2">Generating Your Report...</h2>
                        <p className="text-muted-foreground">
                            Analyzing your responses and preparing detailed feedback.
                        </p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;
