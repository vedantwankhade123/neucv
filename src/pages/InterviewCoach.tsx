import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Square, Volume2, VolumeX, Loader2, ChevronRight, Home, PlusCircle, Settings, Keyboard, Bot } from 'lucide-react';
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
    
    // Refs
    const timerIntervalRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Initial state
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [phase, setPhase] = useState<InterviewPhase>('interview');

    // Settings
    const [inputMode, setInputMode] = useState<InputMode>('voice');
    const [autoSubmit, setAutoSubmit] = useState(true);
    const [autoNext, setAutoNext] = useState(true);
    const [isTTSEnabled, setIsTTSEnabled] = useState(true);

    // Status
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0); // 0-100 for visualizer

    // Interview flow
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [displayedQuestion, setDisplayedQuestion] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [isWaitingForNext, setIsWaitingForNext] = useState(false);

    // Initialize
    useEffect(() => {
        const data = location.state?.interviewData as InterviewData;
        if (data) {
            setInterviewData(data);
            setQuestionStartTime(Date.now());
            
            const settings = getAutoSaveSettings();
            setAutoSubmit(settings.interviewAutoSubmit);
            setAutoNext(settings.interviewAutoNext);
            setIsTTSEnabled(settings.interviewTTS);
        } else {
            navigate('/dashboard/interview');
        }
        
        return () => {
            stopAudioAnalysis();
            stopTTS();
        };
    }, [location.state, navigate]);

    // Handle Settings
    const handleSettingChange = (key: string, value: boolean) => {
        if (key === 'autoSubmit') setAutoSubmit(value);
        if (key === 'autoNext') setAutoNext(value);
        if (key === 'tts') {
            setIsTTSEnabled(value);
            if (!value) stopTTS();
        }
        
        const globalKey = key === 'autoSubmit' ? 'interviewAutoSubmit' : 
                          key === 'autoNext' ? 'interviewAutoNext' : 'interviewTTS';
        updateInterviewSettings({ [globalKey]: value });
    };

    // --- Audio Visualization Logic ---
    const startAudioAnalysis = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            
            if (!mediaStreamRef.current) {
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;
                
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                
                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArrayRef.current[i];
                }
                const average = sum / bufferLength;
                
                // Normalize to 0-100 roughly
                // Use a sensitivity factor
                const level = Math.min(100, Math.round(average * 1.5)); 
                setAudioLevel(level);
                
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            
            updateVolume();
        } catch (error) {
            console.error("Error starting audio analysis:", error);
        }
    };

    const stopAudioAnalysis = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        // Don't close context/tracks here necessarily to keep mic active for recognition
        // But for visualizer we can just stop updating state
        setAudioLevel(0);
    };

    // --- Text to Speech Logic ---
    const speakText = useCallback((text: string) => {
        if (!isTTSEnabled || !window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to select a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        utterance.onerror = () => setIsAiSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isTTSEnabled]);

    const stopTTS = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsAiSpeaking(false);
    };

    // --- Question Flow & Typing Effect ---
    useEffect(() => {
        if (!interviewData || phase !== 'interview') return;

        const questionText = interviewData.questions[currentQuestionIndex].question;
        setDisplayedQuestion('');
        setIsTyping(true);
        stopListening(); // Stop mic while AI is "thinking/typing"
        stopTTS();

        let i = 0;
        const typeChar = () => {
            if (i < questionText.length) {
                setDisplayedQuestion(questionText.substring(0, i + 1));
                i++;
                // Slightly faster typing
                typingTimeoutRef.current = setTimeout(typeChar, 20); 
            } else {
                setIsTyping(false);
                setQuestionStartTime(Date.now());
                
                // 1. AI Speaks the question
                speakText(questionText);

                // 2. Start listening automatically (if voice mode)
                // Wait a moment for speech to start or user to process
                if (inputMode === 'voice') {
                    // Delay start listening slightly to avoid picking up system audio if no headphones
                    // Ideally check isAiSpeaking but for simplicity just delay
                    setTimeout(() => startListening(), 500); 
                }
            }
        };

        // Start typing
        typingTimeoutRef.current = setTimeout(typeChar, 300);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            stopTTS();
        };
    }, [currentQuestionIndex, interviewData, phase, inputMode]); // Removed speakText dependency to avoid loops

    // --- Speech Recognition ---
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
                    startAudioAnalysis(); // Start visualizer
                };

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        }
                    }

                    if (finalTranscript) {
                        setCurrentAnswer(prev => prev + finalTranscript);
                        resetSilenceTimer();
                    } else {
                        // Interim results (user is speaking)
                        resetSilenceTimer();
                    }
                };

                recognition.onerror = (event: any) => {
                    if (event.error !== 'no-speech') {
                        console.error('Speech recognition error:', event.error);
                    }
                    // Don't stop on no-speech, just keep listening
                    if (event.error !== 'no-speech') {
                        setIsListening(false);
                        stopAudioAnalysis();
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                    stopAudioAnalysis();
                };

                recognitionRef.current = recognition;
            }
        }
        
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            stopAudioAnalysis();
        };
    }, [phase]);

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (inputMode === 'voice' && autoSubmit) {
            // 2.5 seconds silence trigger
            silenceTimerRef.current = setTimeout(() => {
                handleSilenceDetected();
            }, 2500); 
        }
    };

    const handleSilenceDetected = () => {
        if (isListening) {
            // Only submit if we have a meaningful answer
            // Access currentAnswer from ref or check length in submit handler
            // Just trigger submit, let validation handle it
            // We need to stop first
            stopListening();
            document.getElementById('auto-submit-trigger')?.click();
        }
    };

    const startListening = () => {
        try {
            if (recognitionRef.current && !isListening) {
                // Stop TTS if it's playing when user starts mic
                stopTTS();
                recognitionRef.current.start();
            }
        } catch (e) {
            // Ignore if already started
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        stopAudioAnalysis();
    };

    const toggleListening = () => {
        if (isListening) stopListening();
        else startListening();
    };

    const toggleInputMode = () => {
        const newMode = inputMode === 'voice' ? 'text' : 'voice';
        setInputMode(newMode);
        if (newMode === 'text') stopListening();
    };

    const handleSubmitAnswer = async () => {
        if (!interviewData || isSubmittingAnswer) return;
        
        stopListening();
        stopTTS();

        if (!currentAnswer.trim()) return;

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
                if (autoNext) {
                    setIsWaitingForNext(true);
                    setTimeout(() => {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setCurrentAnswer('');
                        setIsWaitingForNext(false);
                        // useEffect will handle next question logic
                    }, 1000);
                } else {
                    setIsWaitingForNext(true);
                }
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to submit answer.', variant: 'destructive' });
            setIsSubmittingAnswer(false);
        } finally {
            if (!autoNext) setIsSubmittingAnswer(false);
            // If autoNext, it stays true briefly until index change
            setTimeout(() => setIsSubmittingAnswer(false), 1000);
        }
    };

    const handleManualNext = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
        setIsWaitingForNext(false);
    };

    const handleExit = () => {
        if (confirm("Exit interview? Progress will be lost.")) {
            stopListening();
            stopTTS();
            navigate('/dashboard');
        }
    };

    const completeInterview = async (finalData: InterviewData) => {
        stopListening();
        stopTTS();
        setIsGeneratingReport(true);
        setAnalysisProgress(0);

        try {
            // Processing logic (same as before)
            const totalResponses = finalData.responses.length;
            const evaluatedResponses: InterviewResponse[] = [];

            for (let i = 0; i < totalResponses; i++) {
                const response = finalData.responses[i];
                const question = finalData.questions.find(q => q.id === response.questionId);
                
                if (question) {
                    setAnalysisProgress(Math.round(((i) / totalResponses) * 60));
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

            setAnalysisProgress(70);
            const dataWithEvaluations = { ...finalData, responses: evaluatedResponses };
            const report = await generateInterviewReport(dataWithEvaluations);
            setAnalysisProgress(100);

            const completedData: InterviewData = {
                ...dataWithEvaluations,
                endTime: Date.now(),
                status: 'completed',
                report
            };

            setInterviewData(completedData);
            setPhase('report');
        } catch (error) {
            console.error(error);
            setPhase('report'); // Show what we have
        } finally {
            setIsGeneratingReport(false);
        }
    };

    if (phase === 'report' && interviewData) {
        return (
            <InterviewReport
                interviewData={interviewData}
                onNewInterview={() => navigate('/dashboard/interview')}
                onBackToDashboard={() => navigate('/dashboard')}
            />
        );
    }

    if (!interviewData) return null;

    const currentQuestion = interviewData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100;

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-14 border-b px-4 flex items-center justify-between bg-white z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleExit}>
                        <Home className="h-5 w-5 text-slate-500" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 leading-none">AI Coach</h1>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{interviewData.setupData.jobRole}</p>
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
                        <PopoverContent className="w-80 p-4 mr-4">
                            <h4 className="font-medium mb-3 text-sm">Session Settings</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="tts" className="text-sm">AI Voice (Text-to-Speech)</Label>
                                    <Switch id="tts" checked={isTTSEnabled} onCheckedChange={(v) => handleSettingChange('tts', v)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-submit" className="text-sm flex flex-col">
                                        <span>Auto-Submit Answer</span>
                                        <span className="text-xs text-muted-foreground font-normal">On silence detection</span>
                                    </Label>
                                    <Switch id="auto-submit" checked={autoSubmit} onCheckedChange={(v) => handleSettingChange('autoSubmit', v)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-next" className="text-sm flex flex-col">
                                        <span>Auto-Next Question</span>
                                        <span className="text-xs text-muted-foreground font-normal">After submitting</span>
                                    </Label>
                                    <Switch id="auto-next" checked={autoNext} onCheckedChange={(v) => handleSettingChange('autoNext', v)} />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button variant="destructive" size="sm" onClick={() => completeInterview(interviewData)} className="h-8 text-xs gap-2">
                        <Square className="h-3 w-3 fill-current" /> Finish
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50 flex items-center justify-center">
                <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 h-[600px]">
                    
                    {/* Left: AI Avatar & Visualization */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-4 h-full">
                        <Card className="flex-grow bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border-0 shadow-xl relative flex flex-col items-center justify-center p-8 overflow-hidden">
                            {/* Abstract AI Avatar Circle */}
                            <div className="relative z-10">
                                {/* Base Circle */}
                                <div className={cn(
                                    "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                                    isAiSpeaking ? "bg-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.3)]" : 
                                    isListening ? "bg-green-500/10" : "bg-slate-700/50"
                                )}>
                                    {/* Inner Reactive Circle */}
                                    <div 
                                        className={cn(
                                            "w-24 h-24 rounded-full transition-all duration-100 flex items-center justify-center",
                                            isAiSpeaking ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse" :
                                            isListening ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]" :
                                            "bg-slate-600"
                                        )}
                                        style={{
                                            transform: isListening 
                                                ? `scale(${1 + (audioLevel / 200)})` // Scale based on user mic volume
                                                : isAiSpeaking 
                                                    ? 'scale(1.1)' 
                                                    : 'scale(1)'
                                        }}
                                    >
                                        {isListening ? (
                                            <Mic className="h-10 w-10 text-white" />
                                        ) : isAiSpeaking ? (
                                            <Volume2 className="h-10 w-10 text-white" />
                                        ) : (
                                            <Bot className="h-10 w-10 text-white/50" />
                                        )}
                                    </div>
                                </div>
                                
                                {/* Listening Rings */}
                                {isListening && (
                                    <>
                                        <div className="absolute inset-0 rounded-full border border-green-500/30 animate-[ping_1.5s_infinite]" />
                                        <div className="absolute inset-[-10px] rounded-full border border-green-500/20 animate-[ping_2s_infinite]" />
                                    </>
                                )}
                            </div>

                            <div className="mt-8 text-center space-y-2 z-10">
                                <h3 className="text-white font-medium text-lg tracking-wide">
                                    {isAiSpeaking ? "Speaking..." : isListening ? "Listening..." : "Thinking..."}
                                </h3>
                                <p className="text-slate-400 text-sm h-5">
                                    {isWaitingForNext ? "Saving answer..." : isListening ? "Speak clearly..." : ""}
                                </p>
                            </div>

                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 to-transparent pointer-events-none" />
                        </Card>
                    </div>

                    {/* Right: Interaction Area */}
                    <div className="w-full lg:w-7/12 flex flex-col gap-4 h-full">
                        {/* Progress */}
                        <div className="flex items-center gap-3 px-1">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
                            </span>
                            <Progress value={progress} className="h-2 flex-grow" />
                        </div>

                        {/* Question */}
                        <Card className="p-6 bg-white border-l-4 border-l-primary shadow-sm min-h-[140px] flex flex-col justify-center">
                            <div className="flex gap-2 mb-3">
                                <Badge variant="secondary" className="text-[10px] h-5">{currentQuestion.category}</Badge>
                                <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground capitalize">{currentQuestion.difficulty}</Badge>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
                                {displayedQuestion}
                                {isTyping && <span className="inline-block w-2 h-5 ml-1 bg-primary align-middle animate-pulse" />}
                            </h2>
                        </Card>

                        {/* Input Area */}
                        <Card className={cn(
                            "flex-grow flex flex-col shadow-sm border-slate-200 relative overflow-hidden bg-white transition-all duration-300",
                            isListening ? "ring-2 ring-green-500/20 border-green-500/30" : ""
                        )}>
                            <div className="p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2 px-2">
                                    {inputMode === 'voice' ? <Mic className="h-3.5 w-3.5 text-primary" /> : <Keyboard className="h-3.5 w-3.5 text-primary" />}
                                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                        {inputMode === 'voice' ? 'Voice Mode' : 'Text Mode'}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleInputMode}
                                    className="h-6 text-[10px] text-muted-foreground hover:text-primary"
                                >
                                    Switch to {inputMode === 'voice' ? 'Text' : 'Voice'}
                                </Button>
                            </div>
                            
                            <div className="relative flex-grow">
                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder={inputMode === 'voice' ? "Listening... Your speech will appear here." : "Type your answer here..."}
                                    className="h-full resize-none border-0 focus-visible:ring-0 text-lg p-6 leading-relaxed bg-transparent text-slate-800 placeholder:text-slate-300"
                                    disabled={isSubmittingAnswer || isWaitingForNext}
                                />
                                
                                {inputMode === 'voice' && (
                                    <div className="absolute bottom-4 right-4">
                                        <Button
                                            size="icon"
                                            variant={isListening ? "destructive" : "default"}
                                            className={cn(
                                                "rounded-full h-12 w-12 shadow-lg transition-all duration-300",
                                                isListening ? "animate-pulse ring-4 ring-red-100 scale-110" : "hover:scale-105"
                                            )}
                                            onClick={toggleListening}
                                        >
                                            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <div className="text-xs text-muted-foreground font-medium pl-2">
                                    {currentAnswer.length} chars
                                </div>
                                <div className="flex gap-2">
                                    {/* Submit Button Trigger for Auto-Submit */}
                                    <Button
                                        id="auto-submit-trigger"
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isSubmittingAnswer || isWaitingForNext}
                                        className="px-6 h-9 shadow-sm"
                                    >
                                        {isSubmittingAnswer ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isWaitingForNext ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <>Submit <ChevronRight className="ml-2 h-4 w-4" /></>
                                        )}
                                    </Button>
                                    
                                    {!autoNext && isWaitingForNext && (
                                        <Button onClick={handleManualNext} className="h-9">
                                            Next <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Minimalist Loader */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative mb-8">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                        <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Analyzing Session</h2>
                    <p className="text-slate-500 text-sm">Generating your personalized feedback report...</p>
                    <div className="w-64 h-1 bg-slate-100 rounded-full mt-8 overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${analysisProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;