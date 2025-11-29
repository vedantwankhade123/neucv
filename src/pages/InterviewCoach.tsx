import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Square, Loader2, CheckCircle2, ChevronRight, Home, PlusCircle, Settings, Keyboard, Bot, Sparkles, Volume2, FastForward } from 'lucide-react';
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
import { getAutoSaveSettings, updateInterviewSettings } from '@/lib/settings';

type InterviewPhase = 'interview' | 'report';
type InputMode = 'voice' | 'text';

const InterviewCoach = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const timerIntervalRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial state from location
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [phase, setPhase] = useState<InterviewPhase>('interview');

    // Interview Configuration
    const [inputMode, setInputMode] = useState<InputMode>('voice');
    const [autoSubmit, setAutoSubmit] = useState(true);
    const [autoNext, setAutoNext] = useState(true);
    const [isListening, setIsListening] = useState(false);

    // Interview state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [displayedQuestion, setDisplayedQuestion] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    // Waiting state for Auto Next
    const [isWaitingForNext, setIsWaitingForNext] = useState(false);

    // Initialize data from navigation state and settings
    useEffect(() => {
        const data = location.state?.interviewData as InterviewData;
        if (data) {
            setInterviewData(data);
            setQuestionStartTime(Date.now());
            
            // Load settings
            const settings = getAutoSaveSettings();
            setAutoSubmit(settings.interviewAutoSubmit);
            setAutoNext(settings.interviewAutoNext);
        } else {
            navigate('/dashboard/interview');
        }
    }, [location.state, navigate]);

    // Handle Settings Changes
    const handleSettingChange = (key: string, value: boolean) => {
        if (key === 'autoSubmit') setAutoSubmit(value);
        if (key === 'autoNext') setAutoNext(value);
        
        // Map to global settings keys
        const globalKey = key === 'autoSubmit' ? 'interviewAutoSubmit' : 'interviewAutoNext';
        updateInterviewSettings({ [globalKey]: value });
    };

    // Handle Input Mode Switch
    const toggleInputMode = () => {
        const newMode = inputMode === 'voice' ? 'text' : 'voice';
        setInputMode(newMode);
        
        if (newMode === 'text') {
            stopListening();
        } else if (!isTyping && !isSubmittingAnswer && !isWaitingForNext) {
            // If switching to voice and not busy, start listening
            startListening();
        }
    };

    // Typewriter Effect for Questions
    useEffect(() => {
        if (!interviewData || phase !== 'interview') return;

        const questionText = interviewData.questions[currentQuestionIndex].question;
        setDisplayedQuestion('');
        setIsTyping(true);
        stopListening(); // Stop any previous listening

        let i = 0;
        const typeChar = () => {
            if (i < questionText.length) {
                setDisplayedQuestion(questionText.substring(0, i + 1));
                i++;
                typingTimeoutRef.current = setTimeout(typeChar, 30); // Typing speed
            } else {
                setIsTyping(false);
                setQuestionStartTime(Date.now());
                // Start listening automatically if in voice mode
                if (inputMode === 'voice') {
                    setTimeout(() => startListening(), 500);
                }
            }
        };

        typingTimeoutRef.current = setTimeout(typeChar, 500); // Initial delay

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [currentQuestionIndex, interviewData, phase]); // Re-run when question changes

    // Initialize Speech Recognition
    useEffect(() => {
        if (phase === 'interview' && typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    setIsListening(true);
                };

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
                        resetSilenceTimer();
                    } else if (interimTranscript) {
                        // Just activity, reset timer
                        resetSilenceTimer();
                    }
                };

                recognition.onerror = (event: any) => {
                    if (event.error !== 'no-speech') {
                        console.error('Speech recognition error:', event.error);
                        setIsListening(false);
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                    // If we stopped intentionally (silence detected), don't restart immediately
                };

                recognitionRef.current = recognition;
            }
        }
        
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
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
        // Only submit if we are actually listening and have some content
        // We check recognition state directly or rely on isListening logic
        if (isListening) {
            stopListening();
            
            // Check if we have a substantial answer to submit
            // Using a ref for currentAnswer might be safer in closure, but state usually works in React 18 effects if deps correct
            // Here we rely on the state being accessible.
            // However, inside setTimeout, state might be stale.
            // Let's rely on the user confirming visually or just triggering submit which checks state.
            
            // Trigger submission
            // We need to call handleSubmitAnswer but we need to ensure we access the latest currentAnswer
            // Since this function is closed over the render scope, let's use a ref for answer if needed, 
            // OR just trigger a useEffect dependency?
            // Actually, simply calling the function should work if the component re-renders on answer update.
            // But resetSilenceTimer is called often. 
            // The cleanest way:
            document.getElementById('auto-submit-trigger')?.click();
        }
    };

    const startListening = () => {
        try {
            if (recognitionRef.current && !isListening) {
                recognitionRef.current.start();
                resetSilenceTimer(); // Start timer immediately in case of silence from start
            }
        } catch (e) {
            // Already started or error
            console.log("Mic start handled safely");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        setIsListening(false);
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
        if (!interviewData || isSubmittingAnswer) return;
        
        stopListening();

        if (!currentAnswer.trim()) {
            // If empty (e.g. background noise triggered start then stop), just resume listening if voice
            if (inputMode === 'voice' && !isWaitingForNext) {
                // Optionally restart listening? Or let user click?
                // Let's just return.
            }
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
                // Logic for Next Question
                if (autoNext) {
                    setIsWaitingForNext(true);
                    setTimeout(() => {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setCurrentAnswer('');
                        setIsWaitingForNext(false);
                        // Typing effect will trigger automatically due to index change dependency
                    }, 1500); // Short delay to see "Saved" state
                } else {
                    // Manual next
                    setIsWaitingForNext(true); // Wait for user to click "Next"
                }
            }
        } catch (error: any) {
            console.error('Error submitting answer:', error);
            toast({
                title: 'Submission Failed',
                description: error.message || 'Please try again.',
                variant: 'destructive'
            });
            setIsSubmittingAnswer(false);
        } finally {
            if (!autoNext) {
                setIsSubmittingAnswer(false);
            } else if (currentQuestionIndex + 1 >= interviewData.questions.length) {
                // Completed, so stop loading
                setIsSubmittingAnswer(false);
            }
            // If autoNext is true, we keep isSubmittingAnswer true briefly until state changes to prevent double clicks
            // actually, we reset it in the setTimeout above logic effectively by unmounting/remounting logic or state update
            setTimeout(() => setIsSubmittingAnswer(false), 1500); 
        }
    };

    const handleManualNext = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
        setIsWaitingForNext(false);
        // Typing effect will trigger
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
            setPhase('report'); 
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
    const progress = ((currentQuestionIndex) / interviewData!.questions.length) * 100;
    const timeRemaining = Math.max(0, (interviewData!.setupData.duration * 60) - elapsedTime);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-14 border-b px-4 flex items-center justify-between bg-white z-20 shadow-sm">
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
                                    <Switch 
                                        id="auto-submit" 
                                        checked={autoSubmit} 
                                        onCheckedChange={(v) => handleSettingChange('autoSubmit', v)} 
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-next" className="text-sm flex flex-col">
                                        <span>Auto-Next Question</span>
                                        <span className="text-xs text-muted-foreground font-normal">After submitting answer</span>
                                    </Label>
                                    <Switch 
                                        id="auto-next" 
                                        checked={autoNext} 
                                        onCheckedChange={(v) => handleSettingChange('autoNext', v)} 
                                    />
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

            {/* Main Workspace */}
            <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50">
                <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-6">
                    
                    {/* Left: AI Avatar & Context */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        {/* AI Avatar Card */}
                        <Card className="aspect-video lg:aspect-square bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-xl border-slate-800 relative flex flex-col items-center justify-center p-6">
                            <div className="relative">
                                <div className={cn("w-32 h-32 md:w-40 md:h-40 rounded-full p-1 transition-all duration-300", isListening ? "bg-gradient-to-tr from-primary to-purple-600 animate-pulse" : "bg-slate-700")}>
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-800">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${interviewData!.setupData.jobRole}&backgroundColor=transparent`}
                                            alt="AI Interviewer"
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                                {isListening && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce shadow-lg">
                                        LISTENING
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 text-center space-y-2">
                                <h3 className="text-white font-semibold text-lg">AI Interviewer</h3>
                                <p className="text-slate-400 text-sm max-w-[250px] mx-auto h-5">
                                    {isTyping ? "Asking question..." : isListening ? "Listening to you..." : isWaitingForNext ? "Processing answer..." : "Waiting for response..."}
                                </p>
                            </div>

                            {/* Audio Visualizer */}
                            <div className="mt-8 flex items-center justify-center gap-1 h-8">
                                {[1,2,3,4,5].map((i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-1.5 bg-primary rounded-full transition-all duration-150",
                                            isListening ? "animate-[bounce_1s_infinite]" : "h-1.5 opacity-30"
                                        )}
                                        style={{ animationDelay: `${i * 0.1}s`, height: isListening ? `${Math.random() * 20 + 10}px` : '4px' }}
                                    />
                                ))}
                            </div>
                        </Card>

                        {/* Status Card */}
                        <Card className="p-5 bg-white border-slate-200 shadow-sm flex-grow flex flex-col justify-center">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <Volume2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Status</h4>
                                    <p className="text-sm text-slate-500">
                                        {inputMode === 'voice' ? "Voice Mode Active" : "Text Mode Active"} <br/>
                                        {autoSubmit && inputMode === 'voice' ? "Auto-submit enabled" : "Manual submit"}
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
                        <Card className="p-6 md:p-8 bg-white border-l-4 border-l-primary shadow-sm min-h-[140px] flex flex-col justify-center transition-all duration-300">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                    {interviewData.questions[currentQuestionIndex].category}
                                </Badge>
                                <Badge variant="outline" className="text-xs text-muted-foreground capitalize">
                                    {interviewData.questions[currentQuestionIndex].difficulty}
                                </Badge>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed tracking-tight">
                                {displayedQuestion}
                                {isTyping && <span className="inline-block w-2 h-5 ml-1 bg-primary align-middle animate-pulse" />}
                            </h2>
                        </Card>

                        {/* Answer Input Area */}
                        <Card className={cn(
                            "flex-grow flex flex-col shadow-sm border-slate-200 relative overflow-hidden bg-white transition-all duration-300",
                            isListening ? "ring-2 ring-primary/20" : ""
                        )}>
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
                                    className="h-full resize-none border-0 focus-visible:ring-0 text-lg p-6 leading-relaxed bg-transparent text-slate-800 placeholder:text-slate-300"
                                    disabled={isSubmittingAnswer || isWaitingForNext}
                                />
                                
                                {inputMode === 'voice' && (
                                    <div className="absolute bottom-6 right-6 transition-transform duration-300 hover:scale-105">
                                        <Button
                                            size="lg"
                                            variant={isListening ? "destructive" : "default"}
                                            className={cn(
                                                "rounded-full h-16 w-16 shadow-lg transition-all duration-300 flex flex-col gap-1",
                                                isListening ? "animate-pulse ring-4 ring-red-100" : "bg-primary hover:bg-primary/90"
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
                                    {currentAnswer.length} characters
                                </div>
                                <div className="flex gap-3 items-center">
                                    {isWaitingForNext ? (
                                        <Button disabled className="px-6 bg-green-500 text-white opacity-100">
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Saved
                                        </Button>
                                    ) : !autoNext && isSubmittingAnswer === false && currentAnswer.length > 0 && inputMode === 'text' ? (
                                         // Show manual next button if auto-next is off and answer exists (implied saved if using manual flow correctly)
                                         // Simplified: Always show submit button, it handles next logic
                                         <Button
                                            id="auto-submit-trigger"
                                            onClick={handleSubmitAnswer}
                                            className="px-6 shadow-sm"
                                        >
                                            Submit Answer <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            id="auto-submit-trigger"
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
                                    )}
                                    
                                    {/* Manual Next Button only if Auto Next is OFF and we are waiting */}
                                    {!autoNext && isWaitingForNext && (
                                        <Button onClick={handleManualNext} className="ml-2">
                                            Next Question <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Minimalist Loading Overlay */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-white shadow-sm">
                            <Bot className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Analyzing Performance</h2>
                    <p className="text-slate-500 text-base max-w-sm text-center leading-relaxed">
                        Our AI coach is reviewing your answers, evaluating communication skills, and generating a personalized growth plan.
                    </p>
                    <div className="w-64 h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-300 rounded-full"
                            style={{ width: `${analysisProgress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs font-bold text-primary uppercase tracking-widest">{analysisProgress}% Complete</p>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;