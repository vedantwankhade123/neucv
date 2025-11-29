import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Mic, MicOff, Square, Volume2, Loader2, Bot, Sparkles, 
    CheckCircle2, ArrowRight, Clock, Settings, Home
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
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Function refs
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

    const inputModeRef = useRef(inputMode);
    useEffect(() => { inputModeRef.current = inputMode; }, [inputMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Spectral Ring Visualizer Logic ---
    const drawVisualizer = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Base radius for the ring
        const baseRadius = Math.min(width, height) / 3.5;

        // Clear with a very slight fade for trail effect, or full clear
        // Using full clear for crisp lines on black background
        ctx.fillStyle = '#000000'; // Match card background
        ctx.fillRect(0, 0, width, height);

        // Analyze Audio
        let frequencyData: number[] = new Array(128).fill(0);
        let volume = 0;

        if (isListening && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            // Copy to local array and calculate volume
            let sum = 0;
            for (let i = 0; i < 128; i++) {
                frequencyData[i] = dataArrayRef.current[i];
                sum += frequencyData[i];
            }
            volume = sum / 128;
        } else if (isAiSpeaking) {
            // Simulate lively data for AI
            const t = Date.now() / 1000;
            volume = (Math.sin(t * 5) + 1) * 40 + 20; // Base volume modulation
            for (let i = 0; i < 128; i++) {
                // Perlin-like noise simulation
                frequencyData[i] = (Math.sin(i * 0.1 + t * 2) + Math.cos(i * 0.05 - t)) * 50 + 100;
            }
        } else {
            // Idle state: subtle breathing
            const t = Date.now() / 2000;
            volume = Math.sin(t) * 5 + 10;
            for (let i = 0; i < 128; i++) {
                frequencyData[i] = 20; // minimal noise
            }
        }

        // Normalize volume for scaling
        const scale = 1 + (volume / 255) * 0.2;

        // --- Draw The Spectral Ring ---
        
        // Save context for glowing effect
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // We will draw multiple overlapping sine waves wrapped in a circle
        const time = Date.now() / 1000;
        
        // Define gradients based on state
        const gradient = ctx.createLinearGradient(-baseRadius, -baseRadius, baseRadius, baseRadius);
        if (isListening) {
            // User speaking: Green/Blue theme
            gradient.addColorStop(0, '#4ade80'); // Green
            gradient.addColorStop(0.5, '#60a5fa'); // Blue
            gradient.addColorStop(1, '#a78bfa'); // Purple
        } else if (isAiSpeaking) {
            // AI speaking: Cyan/Purple/Pink (Matches reference image vibe)
            gradient.addColorStop(0, '#22d3ee'); // Cyan
            gradient.addColorStop(0.5, '#818cf8'); // Indigo
            gradient.addColorStop(1, '#e879f9'); // Pink
        } else {
            // Idle: Dim Purple/Grey
            gradient.addColorStop(0, '#4b5563'); 
            gradient.addColorStop(1, '#a78bfa'); 
        }

        ctx.strokeStyle = gradient;
        ctx.globalCompositeOperation = 'screen'; // Additive blending for glow

        // Draw multiple layers of "filaments"
        const layers = 3;
        for (let l = 0; l < layers; l++) {
            ctx.beginPath();
            const points = 180; // Resolution of the ring
            const angleStep = (Math.PI * 2) / points;
            
            ctx.lineWidth = isListening || isAiSpeaking ? 2 : 1;
            
            // Varied line opacity based on audio level
            ctx.globalAlpha = 0.6 + (volume / 500);

            for (let i = 0; i <= points; i++) {
                const angle = i * angleStep;
                
                // Map angle to frequency index (mirrored for symmetry)
                let freqIndex = Math.floor((Math.abs(Math.sin(angle * 2)) * 64)); 
                const value = frequencyData[freqIndex] || 0;

                // Complex wave function for the "filament" look
                // Combines base circle + audio frequency displacement + sine wave rotation
                const waveOffset = Math.sin(angle * 10 + time * (l + 1)) * (value / 5);
                const noiseOffset = Math.cos(angle * 25 - time * 2) * (value / 8);
                
                const r = baseRadius + waveOffset + noiseOffset + (l * 5); // Offset layers slightly

                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.closePath();
            ctx.stroke();
        }

        // Inner Glow Circle
        if (isListening || isAiSpeaking) {
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius * 0.85, 0, Math.PI * 2);
            ctx.fillStyle = isListening ? 'rgba(74, 222, 128, 0.05)' : 'rgba(34, 211, 238, 0.05)';
            ctx.fill();
            
            // Add a subtle outer glow using shadow
            ctx.shadowBlur = 15;
            ctx.shadowColor = isListening ? '#4ade80' : '#22d3ee';
            ctx.stroke(); // Stroke the inner circle lightly
            ctx.shadowBlur = 0; // Reset
        }

        ctx.restore();

        animationFrameRef.current = requestAnimationFrame(drawVisualizer);
    }, [isListening, isAiSpeaking]);

    useEffect(() => {
        drawVisualizer();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [drawVisualizer]);

    // --- Audio Logic ---

    const stopAudioAnalysis = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
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
    }, []);

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
            stopAudioAnalysis();
            stopTTS();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [location.state, navigate, stopAudioAnalysis, stopTTS]);

    const handleSettingChange = (key: string, value: boolean) => {
        if (key === 'tts') {
            setIsTTSEnabled(value);
            if (!value) stopTTS();
            updateInterviewSettings({ interviewTTS: value });
        }
    };

    const startAudioAnalysis = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (!mediaStreamRef.current) {
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
        } catch (error) {
            console.error("Error starting audio analysis:", error);
        }
    };

    const speakText = useCallback((text: string, onComplete?: () => void) => {
        if (!isTTSEnabled || !window.speechSynthesis) {
            onComplete?.();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Google US English') || 
            v.name.includes('Samantha') ||
            v.name.includes('Neural')
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
            await startAudioAnalysis();

            if (recognitionRef.current && !isListening) {
                stopTTS();
                recognitionRef.current.start();
                setIsListening(true);
                
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    stopListeningRef.current?.();
                }, 5000);
            }
        } catch (e) {
            console.log("Mic already active");
        }
    }, [isListening, stopTTS]);

    useEffect(() => {
        startListeningRef.current = startListening;
    }, [startListening]);

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

                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        stopListeningRef.current?.();
                        toast({ description: "Microphone stopped (silence detected)." });
                    }, 2500);
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

    const currentQuestion = interviewData?.questions[currentQuestionIndex];
    const currentQuestionId = currentQuestion?.id;

    useEffect(() => {
        if (!interviewData || !currentQuestion || phase !== 'interview') return;

        const questionText = currentQuestion.question;
        
        setDisplayedQuestion('');
        setIsTyping(true);
        setCurrentAnswer('');
        setIsSubmitting(false);
        setQuestionStartTime(Date.now());
        
        stopListening();
        stopTTS();

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        let i = 0;
        const typeChar = () => {
            if (i < questionText.length) {
                setDisplayedQuestion(questionText.substring(0, i + 1));
                i++;
                typingTimeoutRef.current = setTimeout(typeChar, 20);
            } else {
                setIsTyping(false);
                speakText(questionText, () => {
                    setTimeout(() => {
                        if (inputModeRef.current === 'voice') {
                            startListeningRef.current?.();
                        }
                    }, 500);
                });
            }
        };

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
            const updatedData = { ...interviewData, responses: updatedResponses };

            setInterviewData(updatedData);
            
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
            <header className="h-16 border-b px-4 lg:px-6 flex items-center justify-between bg-white z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleExit} title="Back to Dashboard" className="hover:bg-slate-100">
                        <Home className="h-5 w-5 text-slate-500" />
                    </Button>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold text-slate-900 leading-none">AI Coach</h1>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 max-w-[150px] truncate">
                                {interviewData!.setupData.jobRole}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Timer Display */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200 shadow-sm hover:border-primary/20 transition-colors">
                    <Clock className="h-4 w-4 text-primary/70 animate-[pulse_3s_infinite]" />
                    <span className="text-sm font-mono font-semibold text-slate-700 min-w-[3rem] text-center">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 mr-4 shadow-xl border-slate-200">
                            <h4 className="font-semibold mb-4 text-sm flex items-center gap-2">
                                <Settings className="h-4 w-4 text-primary" /> Session Settings
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <Label htmlFor="tts" className="text-sm cursor-pointer font-medium">AI Voice</Label>
                                    <Switch id="tts" checked={isTTSEnabled} onCheckedChange={(v) => handleSettingChange('tts', v)} />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => completeInterview(interviewData!)} 
                        className="h-9 px-3 sm:px-4 text-xs gap-2 shadow-sm hover:shadow transition-all"
                    >
                        <Square className="h-3 w-3 fill-current" /> 
                        <span className="hidden sm:inline">Finish</span>
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50/50 flex flex-col items-center">
                {/* Added py-4 to ensure spacing from header */}
                <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-8 h-full max-h-[700px] min-h-[500px] py-2">
                    
                    {/* Left: Modern AI Visualizer */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-4 h-full">
                        <Card className="flex-grow bg-black rounded-3xl border-0 shadow-2xl relative flex flex-col items-center justify-center p-0 overflow-hidden group ring-1 ring-white/10">
                            {/* Header Status */}
                            <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
                                <Badge variant="outline" className={cn(
                                    "backdrop-blur-md px-4 py-1.5 text-xs uppercase tracking-wider font-semibold border-white/10 transition-all duration-300",
                                    isListening ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                                    isAiSpeaking ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                    "bg-white/5 text-slate-400"
                                )}>
                                    {isAiSpeaking ? 'AI Speaking' : isListening ? 'Listening' : 'Ready'}
                                </Badge>
                            </div>

                            {/* Canvas Visualizer - Centered & Full */}
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <canvas 
                                    ref={canvasRef} 
                                    width={500} 
                                    height={500}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Background decoration - Deep Void */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black pointer-events-none" />
                        </Card>

                        {/* Coach Tip */}
                        <Card className="p-5 bg-white border-slate-200/60 shadow-sm flex-grow-0 h-fit rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="flex gap-4 items-start relative z-10">
                                <div className="bg-blue-50 p-2.5 rounded-xl h-fit text-blue-600 shrink-0 border border-blue-100 shadow-sm">
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
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                Question {currentQuestionIndex + 1} / {interviewData!.questions.length}
                            </span>
                            <Progress value={progress} className="h-2 flex-grow bg-slate-200" indicatorClassName="bg-primary transition-all duration-500" />
                            <span className="text-xs font-mono font-medium text-slate-500">{Math.round(progress)}%</span>
                        </div>

                        {/* Question Card */}
                        <Card className="p-8 bg-white border-0 shadow-lg shadow-slate-200/40 rounded-3xl flex flex-col justify-center min-h-[180px] relative overflow-hidden transition-all group hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary transition-all group-hover:w-2" />
                            <div className="flex flex-wrap gap-2 mb-5">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-3 py-1 text-xs font-medium">
                                    {currentQuestion?.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs text-slate-500 capitalize px-3 py-1 bg-slate-50 border-slate-200">
                                    {currentQuestion?.difficulty}
                                </Badge>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed tracking-tight">
                                {displayedQuestion}
                                {isTyping && <span className="inline-block w-2.5 h-6 ml-1.5 bg-primary align-middle animate-pulse rounded-full" />}
                            </h2>
                        </Card>

                        {/* Answer Input Area */}
                        <Card className={cn(
                            "flex-grow flex flex-col shadow-lg shadow-slate-200/40 border-0 rounded-3xl relative overflow-hidden bg-white transition-all duration-300 ring-1 ring-slate-200",
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
                                    className="h-7 text-xs font-medium text-slate-500 hover:text-primary hover:bg-white px-3"
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
                                        {/* Enhanced Mic Animation */}
                                        <div className="relative">
                                            {isListening && (
                                                <>
                                                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                                                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 animate-[pulse_2s_infinite] scale-125"></span>
                                                </>
                                            )}
                                            <Button
                                                size="icon"
                                                variant={isListening ? "destructive" : "default"}
                                                className={cn(
                                                    "relative rounded-full h-16 w-16 shadow-2xl transition-all duration-300 border-4 border-white",
                                                    isListening 
                                                        ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/50" 
                                                        : "bg-slate-900 hover:bg-slate-800 hover:scale-105"
                                                )}
                                                onClick={toggleListening}
                                            >
                                                {isListening ? (
                                                    <MicOff className="h-7 w-7 text-white" />
                                                ) : (
                                                    <Mic className="h-7 w-7 text-white" />
                                                )}
                                            </Button>
                                        </div>
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
                                    className="px-8 h-10 shadow-md rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
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