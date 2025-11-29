import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Square, Volume2, Loader2, CheckCircle2, ArrowRight, Clock, ChevronRight, Home, PlusCircle, Settings, Keyboard, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { InterviewReport } from '@/components/InterviewReport';
import { InterviewData, InterviewResponse } from '@/types/interview';
import { evaluateInterviewResponse, generateInterviewReport } from '@/lib/gemini';
import { calculatePerformanceScore, formatDuration } from '@/lib/interview-service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type InterviewPhase = 'interview' | 'report';
type InputMode = 'voice' | 'text';

const InterviewCoach = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const timerIntervalRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial state from location
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [phase, setPhase] = useState<InterviewPhase>('interview');

    // Interview Configuration
    const [inputMode, setInputMode] = useState<InputMode>('voice');
    const [autoSubmit, setAutoSubmit] = useState(true);
    const [isListening, setIsListening] = useState(false);

    // Interview state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    // Initialize data from navigation state
    useEffect(() => {
        const data = location.state?.interviewData as InterviewData;
        if (data) {
            setInterviewData(data);
            setQuestionStartTime(Date.now());
        } else {
            navigate('/dashboard/interview');
        }
    }, [location.state, navigate]);

    // Handle Input Mode Switch
    const toggleInputMode = () => {
        const newMode = inputMode === 'voice' ? 'text' : 'voice';
        setInputMode(newMode);
        
        if (newMode === 'text') {
            stopListening();
        } else {
            // Optional: Auto-start listening when switching back to voice?
            // startListening(); 
        }
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if (phase === 'interview' && typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        setCurrentAnswer(prev => prev + finalTranscript);
                        // Reset silence timer on final result
                        resetSilenceTimer();
                    }
                    
                    // Also reset on interim results to keep listening while talking
                    if (interimTranscript) {
                        resetSilenceTimer();
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'no-speech') {
                        // Just restart if no speech detected, don't stop
                        return; 
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    // Logic handled in stopListening or manual stop
                };

                recognitionRef.current = recognition;
            }
        }
    }, [phase]);

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        // Only set timer if in voice mode and auto-submit is enabled
        if (inputMode === 'voice' && autoSubmit) {
            silenceTimerRef.current = setTimeout(() => {
                handleSilenceDetected();
            }, 2500); // 2.5 seconds of silence triggers submit
        }
    };

    const handleSilenceDetected = () => {
        if (isListening) {
            stopListening();
            // Automatically submit if we have an answer
            if (currentAnswer.trim().length > 0) {
                toast({
                    title: "Silence Detected",
                    description: "Auto-submitting your answer...",
                });
                handleSubmitAnswer();
            }
        }
    };

    const startListening = () => {
        try {
            recognitionRef.current?.start();
            setIsListening(true);
            resetSilenceTimer();
        } catch (e) {
            console.error("Error starting speech recognition:", e);
        }
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Submit answer handler
    const handleSubmitAnswer = async () => {
        if (!interviewData) return;
        
        // Ensure listening is stopped before processing
        stopListening();

        // Allow submitting empty answers in voice mode if auto-submit triggered falsely? 
        // No, better to check length.
        if (!currentAnswer.trim()) {
            // If triggered by auto-submit but empty, just return (maybe just background noise)
            return;
        }

        setIsSubmittingAnswer(true);

        try {
            const currentQuestion = interviewData.questions[currentQuestionIndex];
            const questionDuration = Math.floor((Date.now() - questionStartTime) / 1000);

            const response: InterviewResponse = {
                questionId: currentQuestion.id,
                answer: currentAnswer,
                timestamp: Date.now(),
                duration: questionDuration
            };

            const updatedResponses = [...interviewData.responses, response];
            const updatedData = {
                ...interviewData,
                responses: updatedResponses,
                currentQuestionIndex: currentQuestionIndex + 1
            };

            setInterviewData(updatedData);

            if (currentQuestionIndex + 1 >= interviewData.questions.length) {
                await completeInterview(updatedData);
            } else {
                // Move to next question
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentAnswer('');
                setQuestionStartTime(Date.now());
                
                // If in voice mode & auto-submit is on, maybe auto-start listening for next question?
                // For now, let's keep it manual start for next question to allow reading time.
                // OR we can add a small delay and start listening.
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

    const handleEndInterviewEarly = async () => {
        if (!interviewData) return;
        
        if (confirm("End interview early? We will generate a report based on answers so far.")) {
            stopListening();
            await completeInterview(interviewData);
        }
    };

    const handleExit = () => {
        if (confirm("Leave session? Progress will be lost.")) {
            stopListening();
            navigate('/dashboard');
        }
    };

    const handleNewSession = () => {
        if (confirm("Start new session? Current progress will be lost.")) {
            stopListening();
            navigate('/dashboard/interview');
        }
    };

    const completeInterview = async (finalData: InterviewData) => {
        stopListening();
        setIsGeneratingReport(true);
        setAnalysisProgress(0);

        try {
            const totalResponses = finalData.responses.length;
            const evaluatedResponses: InterviewResponse[] = [];

            for (let i = 0; i < totalResponses; i++) {
                const response = finalData.responses[i];
                const question = finalData.questions.find(q => q.id === response.questionId);
                
                if (question) {
                    setAnalysisProgress(Math.round(((i) / totalResponses) * 50));
                    const evaluation = await evaluateInterviewResponse(
                        question.question,
                        response.answer,
                        finalData.setupData.language
                    );
                    evaluatedResponses.push({ ...response, evaluation });
                } else {
                    evaluatedResponses.push(response);
                }
            }

            setAnalysisProgress(60);
            const dataWithEvaluations = { ...finalData, responses: evaluatedResponses };
            const report = await generateInterviewReport(dataWithEvaluations);
            setAnalysisProgress(90);

            const completedData: InterviewData = {
                ...dataWithEvaluations,
                endTime: Date.now(),
                status: 'completed',
                report
            };

            setAnalysisProgress(100);
            setInterviewData(completedData);
            setPhase('report');
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast({
                title: 'Report Generation Failed',
                description: 'Please try again later.',
                variant: 'destructive'
            });
            // Handle fallback...
            setPhase('report'); // Show partial report or error state
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Timer
    useEffect(() => {
        if (phase === 'interview' && interviewData) {
            timerIntervalRef.current = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - interviewData.startTime) / 1000);
                setElapsedTime(elapsed);
                if (elapsed >= interviewData.setupData.duration * 60) {
                    toast({ title: 'Time Up!', description: 'Interview time limit reached.', variant: 'destructive' });
                    completeInterview(interviewData);
                }
            }, 1000);
            return () => {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            };
        }
    }, [phase, interviewData]);

    if (!interviewData && phase === 'interview') return null;

    if (phase === 'report' && interviewData) {
        return (
            <InterviewReport
                interviewData={interviewData}
                onNewInterview={() => navigate('/dashboard/interview')}
                onBackToDashboard={() => navigate('/dashboard')}
            />
        );
    }

    const currentQuestion = interviewData!.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / interviewData!.questions.length) * 100;
    const timeRemaining = Math.max(0, (interviewData!.setupData.duration * 60) - elapsedTime);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-14 border-b px-4 flex items-center justify-between bg-white z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleExit} title="Back to Dashboard">
                        <Home className="h-5 w-5 text-slate-500" />
                    </Button>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 leading-none">AI Interviewer</h1>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{interviewData!.setupData.jobRole}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-500">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 mr-4">
                            <h4 className="font-medium mb-3 text-sm">Session Settings</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-submit" className="text-sm flex flex-col">
                                        <span>Auto-Submit Answers</span>
                                        <span className="text-xs text-muted-foreground font-normal">When silence detected (Voice only)</span>
                                    </Label>
                                    <Switch id="auto-submit" checked={autoSubmit} onCheckedChange={setAutoSubmit} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="input-mode" className="text-sm">Typing Mode</Label>
                                    <Switch 
                                        id="input-mode" 
                                        checked={inputMode === 'text'} 
                                        onCheckedChange={() => toggleInputMode()} 
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className={cn("text-xs font-mono font-medium", timeRemaining < 300 && "text-red-500")}>
                            {formatDuration(timeRemaining)}
                        </span>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={handleNewSession} className="hidden md:flex h-8 text-xs gap-2">
                        <PlusCircle className="h-3.5 w-3.5" /> New
                    </Button>
                    
                    <Button variant="destructive" size="sm" onClick={handleEndInterviewEarly} className="h-8 text-xs gap-2">
                        <Square className="h-3.5 w-3.5 fill-current" /> End
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">
                    
                    {/* Left: AI Avatar & Context */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        {/* AI Avatar Card */}
                        <Card className="aspect-video lg:aspect-square bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-xl border-slate-800 relative flex flex-col items-center justify-center p-6">
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-1 animate-pulse">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-800">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${interviewData!.setupData.jobRole}&backgroundColor=transparent`}
                                            alt="AI Interviewer"
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                                {isListening && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                                        LISTENING
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 text-center space-y-2">
                                <h3 className="text-white font-semibold text-lg">AI Interviewer</h3>
                                <p className="text-slate-400 text-sm max-w-[250px]">
                                    I'm listening. Take your time to answer the question clearly.
                                </p>
                            </div>

                            {/* Audio Visualizer Placeholder */}
                            <div className="mt-8 flex items-center justify-center gap-1 h-8">
                                {[1,2,3,4,5].map((i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-1.5 bg-primary rounded-full transition-all duration-150",
                                            isListening ? "animate-[bounce_1s_infinite]" : "h-1.5 opacity-30"
                                        )}
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    />
                                ))}
                            </div>
                        </Card>

                        {/* Coach Tip */}
                        <Card className="p-5 bg-blue-50 border-blue-100 shadow-sm flex-grow">
                            <div className="flex gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-blue-900 mb-1">Interviewer's Note</h4>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Try to keep your answers concise but detailed. Aim for 1-2 minutes per response.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Question & Input */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full min-h-[500px]">
                        {/* Progress */}
                        <div className="flex items-center gap-3 px-1">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                Question {currentQuestionIndex + 1}/{interviewData!.questions.length}
                            </span>
                            <Progress value={progress} className="h-2 flex-grow" />
                            <Badge variant="outline" className="text-xs">{Math.round(progress)}%</Badge>
                        </div>

                        {/* Question Card */}
                        <Card className="p-6 bg-white border-l-4 border-l-primary shadow-sm">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs">{currentQuestion.category}</Badge>
                                <Badge variant="outline" className="text-xs text-muted-foreground capitalize">{currentQuestion.difficulty}</Badge>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                                {currentQuestion.question}
                            </h2>
                        </Card>

                        {/* Answer Input Area */}
                        <Card className="flex-grow flex flex-col shadow-sm border-slate-200 relative overflow-hidden bg-white">
                            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    {inputMode === 'voice' ? <Mic className="h-4 w-4 text-primary" /> : <Keyboard className="h-4 w-4 text-primary" />}
                                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                        {inputMode === 'voice' ? 'Voice Answer' : 'Text Answer'}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleInputMode}
                                    className="h-7 text-xs text-muted-foreground hover:text-primary"
                                >
                                    Switch to {inputMode === 'voice' ? 'Text' : 'Voice'}
                                </Button>
                            </div>
                            
                            <div className="relative flex-grow">
                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder={inputMode === 'voice' ? "Listening... Speak your answer clearly." : "Type your answer here..."}
                                    className="h-full resize-none border-0 focus-visible:ring-0 text-base p-6 leading-relaxed bg-transparent text-slate-800 placeholder:text-slate-400"
                                    disabled={isSubmittingAnswer || (inputMode === 'voice' && isListening)}
                                />
                                
                                {inputMode === 'voice' && (
                                    <div className="absolute bottom-6 right-6">
                                        <Button
                                            size="lg"
                                            variant={isListening ? "destructive" : "default"}
                                            className={cn(
                                                "rounded-full h-14 w-14 shadow-lg transition-all duration-300",
                                                isListening ? "animate-pulse ring-4 ring-red-100" : "hover:scale-105"
                                            )}
                                            onClick={toggleListening}
                                        >
                                            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <div className="text-xs text-muted-foreground font-medium pl-2">
                                    {currentAnswer.length} chars
                                </div>
                                <div className="flex gap-3 items-center">
                                    {autoSubmit && inputMode === 'voice' && (
                                        <span className="text-[10px] text-muted-foreground hidden sm:inline-block">
                                            Auto-submit on silence enabled
                                        </span>
                                    )}
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isSubmittingAnswer}
                                        className="px-6 shadow-sm"
                                    >
                                        {isSubmittingAnswer ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Submit Answer <ChevronRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Full Screen Loading Overlay */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-500">
                    <div className="flex flex-col items-center max-w-sm text-center p-6">
                        <div className="relative mb-8">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-100"></div>
                            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Session</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Our AI coach is reviewing your answers, evaluating communication skills, and generating a personalized growth plan.
                        </p>
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Progress</span>
                                <span>{analysisProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                    style={{ width: `${analysisProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;