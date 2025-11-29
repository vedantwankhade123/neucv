import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Mic, MicOff, Square, Volume2, Loader2, 
    Home, Settings, Keyboard, Bot, Sparkles, 
    CheckCircle2, ArrowRight, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { InterviewReport } from '@/components/InterviewReport';
import { InterviewData, InterviewResponse } from '@/types/interview';
import { evaluateInterviewResponse, generateInterviewReport } from '@/lib/gemini';
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
    
    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Function refs to avoid dependency cycles
    const startListeningRef = useRef<() => void>(null);
    const stopListeningRef = useRef<() => void>(null);

    // Initial state
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [phase, setPhase] = useState<InterviewPhase>('interview');

    // Settings
    const [inputMode, setInputMode] = useState<InputMode>('voice');
    const [isTTSEnabled, setIsTTSEnabled] = useState(true);

    // Status
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    
    // Interview flow
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [displayedQuestion, setDisplayedQuestion] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    // Sync inputMode to ref for access inside effects
    const inputModeRef = useRef(inputMode);
    useEffect(() => { inputModeRef.current = inputMode; }, [inputMode]);

    // Format time helper
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Audio Visualizer Logic ---

    const drawVisualizer = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        // Styling
        const barWidth = 4;
        const gap = 2;
        const barCount = 40; // Number of bars to draw
        const maxBarHeight = height * 0.4;

        // Colors
        let gradient = ctx.createLinearGradient(0, centerY - maxBarHeight, 0, centerY + maxBarHeight);
        
        if (isListening) {
            gradient.addColorStop(0, '#4ade80'); // Green for user
            gradient.addColorStop(1, '#22c55e');
        } else if (isAiSpeaking) {
            gradient.addColorStop(0, '#67e8f9'); // Cyan for AI
            gradient.addColorStop(1, '#06b6d4');
        } else {
            gradient.addColorStop(0, '#94a3b8'); // Gray for idle
            gradient.addColorStop(1, '#64748b');
        }

        ctx.fillStyle = gradient;

        // Get Audio Data
        let frequencyData: number[] = new Array(barCount).fill(0);

        if (isListening && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            // Downsample frequency data to barCount
            const step = Math.floor(dataArrayRef.current.length / barCount);
            for (let i = 0; i < barCount; i++) {
                // Average out values for smoother bars
                let sum = 0;
                for(let j = 0; j < step; j++) {
                    sum += dataArrayRef.current[i * step + j] || 0;
                }
                frequencyData[i] = sum / step;
            }
        } else if (isAiSpeaking) {
            // Simulate waveform for AI speech
            const time = Date.now() / 150;
            for (let i = 0; i < barCount; i++) {
                // Sine wave pattern
                const offset = i - barCount / 2;
                // Gaussian window to taper edges
                const window = Math.exp(-0.02 * offset * offset);
                // Combine sine waves
                const value = (Math.sin(time + i * 0.5) + Math.sin(time * 2 + i * 0.2)) * 50 + 80;
                frequencyData[i] = value * window;
            }
        } else {
            // Idle gentle breathing
            const time = Date.now() / 1000;
            for (let i = 0; i < barCount; i++) {
                const value = Math.sin(time + i * 0.2) * 5 + 10;
                frequencyData[i] = value;
            }
        }

        // Draw Bars centered
        const totalWidth = barCount * (barWidth + gap);
        const startX = (width - totalWidth) / 2;

        for (let i = 0; i < barCount; i++) {
            const value = frequencyData[i] || 0;
            const normalizedHeight = (value / 255) * maxBarHeight * 2; // Scale height
            // Ensure a minimum height for visibility
            const h = Math.max(normalizedHeight, 4); 
            
            const x = startX + i * (barWidth + gap);
            const y = centerY - h / 2;

            // Rounded bars
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, h, 2);
            ctx.fill();
        }

        animationFrameRef.current = requestAnimationFrame(drawVisualizer);
    }, [isListening, isAiSpeaking]);

    useEffect(() => {
        drawVisualizer();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [drawVisualizer]);

    // --- Audio Logic ---

    const stopAudioContext = useCallback(() => {
        // Don't close context, just suspend if needed, but typically we keep it alive
        // Just clearing animation frame is done in drawVisualizer cleanup
    }, []);

    const stopTTS = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsAiSpeaking(false);
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        setIsListening(false);
        // Note: We don't stop drawVisualizer here, it adapts to state
    }, []);

    // Update function refs
    useEffect(() => {
        stopListeningRef.current = stopListening;
    }, [stopListening]);

    // Initialize Data
    useEffect(() => {
        const data = location.state?.interviewData as InterviewData;
        if (data) {
            setInterviewData(data);
            setQuestionStartTime(Date.now());
            
            const settings = getAutoSaveSettings();
            setIsTTSEnabled(settings.interviewTTS);
        } else {
            navigate('/dashboard/interview');
        }
        
        return () => {
            stopAudioContext();
            stopTTS();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [location.state, navigate, stopAudioContext, stopTTS]);

    const handleSettingChange = (key: string, value: boolean) => {
        if (key === 'tts') {
            setIsTTSEnabled(value);
            if (!value) stopTTS();
            updateInterviewSettings({ interviewTTS: value });
        }
    };

    const initAudioContext = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        // Only get stream if we don't have it or it ended
        if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
            try {
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 128; // Smaller FFT size for smoother visualization bars
                analyserRef.current.smoothingTimeConstant = 0.8;
                source.connect(analyserRef.current);
                
                const bufferLength = analyserRef.current.frequencyBinCount;
                dataArrayRef.current = new Uint8Array(bufferLength);
            } catch (err) {
                console.error("Mic access denied or error:", err);
            }
        }
    };

    const speakText = useCallback((text: string, onComplete?: () => void) => {
        if (!isTTSEnabled || !window.speechSynthesis) {
            onComplete?.();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to select a better voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Google US English') || 
            v.name.includes('Samantha') ||
            v.name.includes('Neural') ||
            v.lang === 'en-US'
        ) || voices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => {
            setIsAiSpeaking(false);
            if (onComplete) onComplete();
        };
        utterance.onerror = (e) => {
            console.error("TTS Error", e);
            setIsAiSpeaking(false);
            if (onComplete) onComplete();
        };

        window.speechSynthesis.speak(utterance);
    }, [isTTSEnabled]);

    const startListening = useCallback(async () => {
        try {
            await initAudioContext(); // Ensure audio context is ready for visualizer

            if (recognitionRef.current && !isListening) {
                stopTTS();
                recognitionRef.current.start();
                setIsListening(true);
                
                // Initial silence timeout (if user says nothing for 5s)
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    stopListeningRef.current?.();
                }, 5000);
            }
        } catch (e) {
            console.log("Mic already active or error");
        }
    }, [isListening, stopTTS]);

    // Update startListening ref
    useEffect(() => {
        startListeningRef.current = startListening;
    }, [startListening]);

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
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        }
                    }

                    if (finalTranscript) {
                        setCurrentAnswer(prev => prev + finalTranscript);
                    }

                    // Reset silence timer on any speech result
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        stopListeningRef.current?.(); // Just stop mic on silence
                        toast({ description: "Microphone stopped (silence detected)." });
                    }, 2500); // Stop mic after 2.5 seconds of silence
                };

                recognition.onerror = (event: any) => {
                    if (event.error !== 'no-speech') {
                        setIsListening(false);
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [phase]);

    // --- Critical: Question Typing Effect ---
    // Depend on Question ID so it only runs when question changes
    const currentQuestion = interviewData?.questions[currentQuestionIndex];
    const currentQuestionId = currentQuestion?.id;

    useEffect(() => {
        if (!interviewData || !currentQuestion || phase !== 'interview') return;

        const questionText = currentQuestion.question;
        
        // Reset state for new question
        setDisplayedQuestion('');
        setIsTyping(true);
        setCurrentAnswer('');
        setIsSubmitting(false);
        setQuestionStartTime(Date.now());
        
        stopListening();
        stopTTS();

        // Clear any existing typing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        let i = 0;
        const typeChar = () => {
            if (i < questionText.length) {
                setDisplayedQuestion(questionText.substring(0, i + 1));
                i++;
                typingTimeoutRef.current = setTimeout(typeChar, 20); // Faster typing
            } else {
                // Finished typing
                setIsTyping(false);
                
                // Speak then listen
                speakText(questionText, () => {
                    // Slight delay to ensure mic doesn't pick up echo of last word
                    setTimeout(() => {
                        if (inputModeRef.current === 'voice') {
                            startListeningRef.current?.();
                        }
                    }, 500);
                });
            }
        };

        // Start typing with slight delay to ensure render
        typingTimeoutRef.current = setTimeout(typeChar, 100);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            stopTTS();
            stopListening();
        };
    }, [currentQuestionId, phase]);

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
        if (!interviewData || isSubmitting || !currentAnswer.trim()) return;
        
        stopListening();
        stopTTS();
        setIsSubmitting(true);

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
            };

            setInterviewData(updatedData);
            
            // Check if this was the last question
            if (currentQuestionIndex + 1 >= interviewData.questions.length) {
                await completeInterview(updatedData);
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
                toast({ title: 'Answer Submitted', description: 'Moving to next question...' });
            }

        } catch (error: any) {
            console.error('Error submitting answer:', error);
            toast({
                title: 'Submission Failed',
                description: error.message || 'Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeInterview = async (finalData: InterviewData) => {
        stopListening();
        stopTTS();
        setIsGeneratingReport(true);
        setAnalysisProgress(0);

        try {
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
            setPhase('report');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleExit = () => {
        if (confirm("Exit interview? Progress will be lost.")) {
            stopListening();
            stopTTS();
            navigate('/dashboard');
        }
    };

    // Timer logic
    useEffect(() => {
        if (phase === 'interview' && interviewData) {
            timerIntervalRef.current = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - interviewData.startTime) / 1000);
                setElapsedTime(elapsed);
                if (elapsed >= interviewData.setupData.duration * 60) {
                    toast({ title: 'Time Up!', description: 'Interview time limit reached.', variant: 'destructive' });
                    if (interviewData.responses.length > 0) {
                        completeInterview(interviewData);
                    } else {
                        navigate('/dashboard');
                    }
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

    const progress = ((currentQuestionIndex) / interviewData!.questions.length) * 100;
    const isLastQuestion = currentQuestionIndex + 1 === interviewData!.questions.length;

    // Status text logic
    let statusText = "Ready";
    if (isGeneratingReport) statusText = "Analyzing Session...";
    else if (isSubmitting) statusText = "Saving Answer...";
    else if (isTyping) statusText = "Interviewer is asking...";
    else if (isAiSpeaking) statusText = "Interviewer is speaking...";
    else if (isListening) statusText = "Listening to you...";
    else if (inputMode === 'voice') statusText = "Mic is off. Tap to speak.";
    else statusText = "Waiting for answer.";

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b px-6 flex items-center justify-between bg-white z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleExit} title="Back to Dashboard">
                        <Home className="h-5 w-5 text-slate-500" />
                    </Button>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-900 leading-none">AI Interview Coach</h1>
                            <p className="text-xs text-muted-foreground font-medium mt-1">{interviewData!.setupData.jobRole}</p>
                        </div>
                    </div>
                </div>
                
                {/* Timer Display */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-mono font-medium text-slate-700">
                        {formatTime(elapsedTime)}
                    </span>
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
                                    <Label htmlFor="tts" className="text-sm">AI Voice (Text-to-Speech)</Label>
                                    <Switch id="tts" checked={isTTSEnabled} onCheckedChange={(v) => handleSettingChange('tts', v)} />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button variant="destructive" size="sm" onClick={() => completeInterview(interviewData!)} className="h-9 px-4 text-xs gap-2 shadow-sm hover:shadow">
                        <Square className="h-3 w-3 fill-current" /> End Session
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-grow p-4 md:p-8 overflow-y-auto bg-slate-50 flex items-center justify-center">
                <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 h-[650px]">
                    
                    {/* Left: Modern AI Visualizer */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-6 h-full">
                        <Card className="flex-grow bg-slate-950 rounded-3xl border-0 shadow-2xl relative flex flex-col items-center justify-center p-8 overflow-hidden group">
                            {/* Header Status */}
                            <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
                                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-1.5 text-xs uppercase tracking-wider">
                                    {isAiSpeaking ? 'AI Speaking' : isListening ? 'Listening' : 'Ready'}
                                </Badge>
                            </div>

                            {/* Canvas Visualizer */}
                            <div className="relative w-full h-48 flex items-center justify-center z-10">
                                <canvas 
                                    ref={canvasRef} 
                                    width={400} 
                                    height={200}
                                    className="w-full h-full object-contain opacity-90"
                                />
                            </div>

                            {/* Status Text & Hints */}
                            <div className="mt-8 text-center space-y-3 z-10 max-w-xs">
                                <h3 className="text-white font-semibold text-xl tracking-tight transition-all">
                                    {statusText}
                                </h3>
                                <p className="text-slate-400 text-sm h-10 leading-relaxed line-clamp-2">
                                    {inputMode === 'voice' && isListening ? "I'm listening to your answer..." : ""}
                                    {isAiSpeaking ? "Listen carefully to the question." : ""}
                                </p>
                            </div>

                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/30 to-slate-950 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />
                        </Card>

                        {/* Coach Tip */}
                        <Card className="p-5 bg-white border-slate-200 shadow-sm flex-grow h-fit rounded-2xl">
                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-50 p-2.5 rounded-xl h-fit text-blue-600 shrink-0">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 mb-1">Coach's Tip</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Use the STAR method (Situation, Task, Action, Result) to structure your answers effectively.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Question & Input */}
                    <div className="w-full lg:w-7/12 flex flex-col gap-6 h-full min-h-[500px]">
                        {/* Progress */}
                        <div className="flex items-center gap-4 px-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                Question {currentQuestionIndex + 1} of {interviewData!.questions.length}
                            </span>
                            <Progress value={progress} className="h-2 flex-grow bg-slate-200" indicatorClassName="bg-primary" />
                            <span className="text-xs font-mono text-slate-400">{Math.round(progress)}%</span>
                        </div>

                        {/* Question Card */}
                        <Card className="p-8 bg-white border-none shadow-lg shadow-slate-200/50 rounded-2xl flex flex-col justify-center min-h-[160px] relative overflow-hidden transition-all">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-3 py-1">
                                    {currentQuestion.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs text-slate-500 capitalize px-3 py-1">
                                    {currentQuestion.difficulty}
                                </Badge>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed tracking-tight">
                                {displayedQuestion}
                                {isTyping && <span className="inline-block w-2 h-6 ml-1.5 bg-primary align-middle animate-pulse rounded-full" />}
                            </h2>
                        </Card>

                        {/* Answer Input Area */}
                        <Card className={cn(
                            "flex-grow flex flex-col shadow-lg shadow-slate-200/50 border-0 rounded-2xl relative overflow-hidden bg-white transition-all duration-300 ring-1 ring-slate-200",
                            isListening ? "ring-2 ring-green-500/50 shadow-green-100" : "focus-within:ring-2 focus-within:ring-primary/20"
                        )}>
                            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                                <div className="flex items-center gap-2 px-2">
                                    {inputMode === 'voice' ? <Mic className="h-4 w-4 text-primary" /> : <Keyboard className="h-4 w-4 text-primary" />}
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        {inputMode === 'voice' ? 'Voice Input' : 'Text Input'}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleInputMode}
                                    className="h-7 text-xs font-medium text-slate-500 hover:text-primary hover:bg-white"
                                >
                                    Switch to {inputMode === 'voice' ? 'Text' : 'Voice'}
                                </Button>
                            </div>
                            
                            <div className="relative flex-grow">
                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder={inputMode === 'voice' ? "Listening... Speak your answer clearly." : "Type your answer here..."}
                                    className="h-full resize-none border-0 focus-visible:ring-0 text-lg p-6 leading-relaxed bg-transparent text-slate-800 placeholder:text-slate-300 font-medium"
                                    disabled={isSubmitting}
                                />
                                
                                {inputMode === 'voice' && (
                                    <div className="absolute bottom-6 right-6">
                                        <Button
                                            size="icon"
                                            variant={isListening ? "destructive" : "default"}
                                            className={cn(
                                                "rounded-full h-14 w-14 shadow-xl transition-all duration-300",
                                                isListening ? "animate-pulse ring-4 ring-red-100 scale-110" : "hover:scale-105 bg-slate-900 hover:bg-slate-800"
                                            )}
                                            onClick={toggleListening}
                                        >
                                            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center backdrop-blur-md">
                                <div className="text-xs text-slate-400 font-medium pl-2">
                                    {currentAnswer.length} chars
                                </div>
                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={!currentAnswer.trim() || isSubmitting}
                                    className="px-8 h-10 shadow-md rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            {isLastQuestion ? 'Complete Interview' : 'Submit & Next'} 
                                            {isLastQuestion ? <CheckCircle2 className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Minimalist Loader */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                        <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Analyzing Session</h2>
                    <p className="text-slate-500 text-base font-medium">Generating your personalized feedback report...</p>
                    <div className="w-72 h-1.5 bg-slate-100 rounded-full mt-10 overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${analysisProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;