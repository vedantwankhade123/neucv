import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Mic, MicOff, Square, Volume2, Loader2, Bot, Sparkles, 
    CheckCircle2, ArrowRight, Clock, Settings, Home, Keyboard, SkipForward, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { InterviewReport } from '@/components/InterviewReport';
import { InterviewData, InterviewResponse } from '@/types/interview';
import { evaluateInterviewResponse, generateInterviewReport } from '@/lib/gemini';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAutoSaveSettings, updateInterviewSettings } from '@/lib/settings';

type InterviewPhase = 'interview' | 'report';
type InputMode = 'voice' | 'text';

const InterviewCoach = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
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
    const [audioLevel, setAudioLevel] = useState(0);
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

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

    // --- High-Fidelity Visualizer ---
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
        const baseRadius = Math.min(width, height) / 3.2;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Analyze Audio
        let frequencyData: number[] = new Array(128).fill(0);
        let volume = 0;
        let mode: 'ai' | 'user' | 'idle' = 'idle';

        if (isListening && analyserRef.current && dataArrayRef.current) {
            // User Speaking (Microphone)
            mode = 'user';
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            let sum = 0;
            for (let i = 0; i < 128; i++) {
                frequencyData[i] = dataArrayRef.current[i];
                sum += frequencyData[i];
            }
            volume = sum / 128;
        } else if (isAiSpeaking) {
            // AI Speaking (Simulation)
            mode = 'ai';
            const t = Date.now() / 1000;
            
            // Complex envelope to mimic speech syllables (bursty)
            const rhythm = Math.sin(t * 12); 
            const variation = Math.cos(t * 5.5); 
            const noise = Math.random() * 0.2; 
            
            const envelope = (Math.max(0, rhythm * variation) + 0.3 + noise);
            volume = Math.min(255, envelope * 100); 
            
            for (let i = 0; i < 128; i++) {
                const offset = i * 0.15;
                const wave = Math.sin(offset + t * 15) * Math.cos(offset * 0.5 - t * 8);
                frequencyData[i] = Math.max(0, (wave + 1) * 80 * envelope + (Math.random() * 20));
            }
        } else {
            // Idle state
            mode = 'idle';
            const t = Date.now() / 2000;
            volume = Math.sin(t) * 5 + 15;
            for (let i = 0; i < 128; i++) {
                frequencyData[i] = 10 + Math.sin(i * 0.2 + t) * 5 + Math.random() * 5; 
            }
        }

        ctx.save();
        ctx.translate(centerX, centerY);

        if (mode === 'user') {
            // --- User Visualizer: Circular Frequency Bars ---
            // A distinct style for user input (Voice Assistant style)
            const barCount = 64; 
            const angleStep = (Math.PI * 2) / barCount;
            const t = Date.now() / 1000;
            
            // Pulse the radius slightly with volume
            const userRadius = baseRadius * 0.9 + (volume / 255) * 10;

            for (let i = 0; i < barCount; i++) {
                // Map bar index to frequency data (mirroring for symmetry)
                // We use the first 64 bins of the 128 available
                let freqIndex = i < barCount / 2 ? i : barCount - 1 - i;
                // Scale index to fit data array length roughly
                freqIndex = Math.floor(freqIndex * (128 / (barCount / 2)));
                
                const value = frequencyData[freqIndex] || 0;
                
                // Calculate bar height
                const barHeight = 10 + (value / 255) * 100;
                
                const angle = i * angleStep - (Math.PI / 2); // Start from top
                
                const x = Math.cos(angle) * userRadius;
                const y = Math.sin(angle) * userRadius;
                const xEnd = Math.cos(angle) * (userRadius + barHeight);
                const yEnd = Math.sin(angle) * (userRadius + barHeight);

                // Dynamic coloring for user voice (Warm colors)
                // Purple to Pink/Orange gradient based on intensity
                const hue = 280 + (value / 255) * 60; // 280 (Purple) -> 340 (Pink)
                const lightness = 60 + (value / 255) * 20;
                
                ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(xEnd, yEnd);
                ctx.stroke();
            }
            
            // Inner glow for user
            ctx.beginPath();
            ctx.arc(0, 0, userRadius - 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 50, 255, ${0.1 + (volume / 255) * 0.2})`;
            ctx.fill();

        } else {
            // --- AI & Idle Visualizer: Filament Ring (Existing) ---
            
            // Scale effect
            const scale = 1 + (volume / 255) * 0.08;
            ctx.scale(scale, scale);
            
            const time = Date.now() / 1000;
            ctx.rotate(time * 0.05);

            ctx.globalCompositeOperation = 'screen'; 

            // Draw Filaments
            const particles = 720;
            const angleStep = (Math.PI * 2) / particles;

            for (let i = 0; i < particles; i++) {
                const angle = i * angleStep;
                
                const freqIndex = Math.floor((Math.abs(Math.sin(angle * 2 + time * 0.2)) * 60)) % 60;
                const freqValue = frequencyData[freqIndex] || 0;
                
                // Color Logic
                const normAngle = (angle / (Math.PI * 2)); 
                const shiftedAngle = (normAngle + 0.2) % 1.0; 
                
                let hue;
                let saturation = 100;
                
                if (mode === 'ai') {
                    // AI Theme: Cool Blue Gradient (Cyan -> Deep Blue)
                    hue = 190 + (Math.sin(angle + time) * 30); 
                } else {
                    // Idle Theme: Subtle Gray-Blue
                    hue = 210;
                    saturation = 20;
                }

                const lightness = 50 + (freqValue / 255) * 40; 
                const alpha = 0.2 + (freqValue / 255) * 0.8;

                ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.lineWidth = 1.5;

                const rStart = baseRadius;
                const rEnd = baseRadius + 15 + (freqValue / 255) * 80; 
                const swirl = 0.15 + (freqValue / 255) * 0.15; 
                
                const x1 = Math.cos(angle) * rStart;
                const y1 = Math.sin(angle) * rStart;
                const x2 = Math.cos(angle + swirl) * rEnd;
                const y2 = Math.sin(angle + swirl) * rEnd;

                const cpX = Math.cos(angle + swirl * 0.5) * (rStart + (rEnd - rStart) * 0.5);
                const cpY = Math.sin(angle + swirl * 0.5) * (rStart + (rEnd - rStart) * 0.5);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo(cpX, cpY, x2, y2);
                ctx.stroke();
            }

            // Inner rim light
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            const rimGradient = ctx.createLinearGradient(-baseRadius, -baseRadius, baseRadius, baseRadius);
            
            if (mode === 'ai') {
                 rimGradient.addColorStop(0, 'rgba(0, 200, 255, 0.8)'); // Cyan
                 rimGradient.addColorStop(1, 'rgba(0, 100, 255, 0.8)'); // Blue
            } else {
                 rimGradient.addColorStop(0, 'rgba(100, 100, 100, 0.3)'); 
                 rimGradient.addColorStop(1, 'rgba(150, 150, 150, 0.3)');
            }

            ctx.strokeStyle = rimGradient;
            ctx.stroke();
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
        setAudioLevel(0);
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
        stopAudioAnalysis();
    }, [stopAudioAnalysis]);

    useEffect(() => {
        stopListeningRef.current = stopListening;
    }, [stopListening]);

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

            const updateVolume = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArrayRef.current[i];
                }
                const average = sum / bufferLength;
                const level = Math.min(100, Math.round(average * 2)); 
                setAudioLevel(level);
                
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
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
                        // Removed auto-start listening
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
                toast.success('Answer Submitted', { description: 'Moving to next question...' });
            }

        } catch (error: any) {
            console.error('Error submitting answer:', error);
            toast.error('Submission Failed', {
                description: error.message || 'Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        if (!interviewData || isSubmitting) return;
        
        stopListening();
        stopTTS();
        setIsSubmitting(true);

        try {
            const currentQuestion = interviewData.questions[currentQuestionIndex];
            const questionDuration = Math.floor((Date.now() - questionStartTime) / 1000);

            const response: InterviewResponse = {
                questionId: currentQuestion.id,
                answer: "Skipped by user.",
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
                toast.info('Question Skipped');
            }

        } catch (error: any) {
            console.error('Error skipping question:', error);
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
                
                // Don't evaluate skipped questions
                if (question && response.answer !== "Skipped by user.") {
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
            console.error('Report generation failed:', error);
            toast.error("Report Generation Failed", {
                description: "Could not generate full analysis. Showing transcript only."
            });
            
            // Create minimal fallback report to prevent crashes
            const fallbackReport = {
                overallScore: 0,
                strengths: ["Analysis unavailable"],
                areasForImprovement: ["Analysis unavailable"],
                recommendations: ["Please review the transcript below"],
                performanceByCategory: []
            };

            setInterviewData(prev => prev ? ({
                ...prev,
                endTime: Date.now(),
                status: 'completed',
                report: fallbackReport
            }) : null);
            
            setPhase('report');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleExitClick = () => {
        setIsExitDialogOpen(true);
    };

    const confirmExit = () => {
        stopListening();
        stopTTS();
        setIsExitDialogOpen(false);
        navigate('/dashboard');
    };

    useEffect(() => {
        if (phase === 'interview' && interviewData) {
            timerIntervalRef.current = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - interviewData.startTime) / 1000);
                setElapsedTime(elapsed);
                
                // Check if time limit reached
                const totalDurationSeconds = interviewData.setupData.duration * 60;
                if (elapsed >= totalDurationSeconds) {
                    toast.warning('Time Up!', { description: 'Interview time limit reached.' });
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

    const progress = ((currentQuestionIndex + 1) / interviewData!.questions.length) * 100;
    const isLastQuestion = currentQuestionIndex + 1 === interviewData!.questions.length;

    let statusText = "Ready";
    if (isGeneratingReport) statusText = "Analyzing Session...";
    else if (isSubmitting) statusText = "Saving Answer...";
    else if (isTyping) statusText = "Interviewer is asking...";
    else if (isAiSpeaking) statusText = "Interviewer is speaking...";
    else if (isListening) statusText = "Listening to you...";
    else if (inputMode === 'voice') statusText = "Mic is off. Tap to speak.";
    else statusText = "Waiting for answer.";

    // Calculate remaining time for countdown
    const durationSeconds = interviewData!.setupData.duration * 60;
    const remainingSeconds = Math.max(0, durationSeconds - elapsedTime);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b px-4 lg:px-6 flex items-center justify-between bg-white z-20 shadow-sm relative">
                <div className="flex items-center gap-4 min-w-[200px]">
                    <Button variant="ghost" size="icon" onClick={handleExitClick} title="Back to Dashboard" className="hover:bg-slate-100">
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
                
                {/* Center: Progress Bar */}
                <div className="flex-1 max-w-md mx-4 hidden md:flex flex-col gap-1.5 justify-center">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <span>Question {currentQuestionIndex + 1}</span>
                        <span>{interviewData?.questions.length} Total</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>
                
                {/* Right Side: Timer & Controls */}
                <div className="flex items-center gap-3 min-w-[200px] justify-end">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs font-mono font-medium text-slate-700">
                            {formatTime(remainingSeconds)}
                        </span>
                    </div>

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

            {/* Main Workspace - Full Width */}
            <main className="flex-grow p-4 md:p-6 overflow-hidden bg-slate-50/50">
                <div className="w-full h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
                    
                    {/* Left: AI Avatar & Visualization */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full min-h-[300px]">
                        <Card className="flex-grow bg-black rounded-3xl border-0 shadow-2xl relative flex flex-col items-center justify-center p-0 overflow-hidden group ring-1 ring-white/10">
                            {/* Header Status */}
                            <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
                                <Badge variant="outline" className={cn(
                                    "backdrop-blur-md px-4 py-1.5 text-xs uppercase tracking-wider font-semibold border-white/10 transition-all duration-300",
                                    isListening ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : 
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

                            {/* Center Overlay: Icon + Text inside the orb */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center w-full pointer-events-none">
                                {/* Icon */}
                                <div className="mb-3">
                                    {isListening ? (
                                        <Mic className="h-10 w-10 text-white/90" />
                                    ) : isAiSpeaking ? (
                                        <Volume2 className="h-10 w-10 text-white/90" />
                                    ) : (
                                        <Bot className="h-10 w-10 text-white/50" />
                                    )}
                                </div>

                                {/* Status Text */}
                                <h3 className="text-white font-medium text-lg tracking-wide transition-all drop-shadow-md">
                                    {statusText}
                                </h3>
                                <p className="text-slate-300 text-sm opacity-80 mt-1 drop-shadow-md min-h-[20px]">
                                    {inputMode === 'voice' && isListening ? "Speak naturally and clearly" : ""}
                                </p>
                            </div>

                            {/* Background decoration - Deep Void */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black pointer-events-none" />
                        </Card>

                        {/* Coach Tip - Smaller and integrated */}
                        <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 flex gap-3 items-start">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-slate-900 mb-0.5 uppercase tracking-wide">Pro Tip</h4>
                                <p className="text-sm text-slate-600 leading-snug">
                                    Use the STAR method (Situation, Task, Action, Result) to structure your answers effectively.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Question & Input */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full min-h-[400px]">
                        
                        {/* Question Card */}
                        <Card className="p-0 border-0 shadow-xl shadow-slate-200/60 rounded-[2rem] flex flex-col h-[320px] shrink-0 relative overflow-hidden bg-white group ring-1 ring-slate-100">
                            {/* Decorative Top Bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
                            
                            <div className="p-8 flex flex-col h-full relative z-10">
                                {/* Header Row: Number & Badges */}
                                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                                    <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                        Question {currentQuestionIndex + 1} <span className="text-slate-300 font-normal">/ {interviewData?.questions.length}</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-0 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                                            {currentQuestion?.category}
                                        </Badge>
                                        <Badge variant="outline" className={cn(
                                            "text-xs capitalize px-3 py-1 border font-medium",
                                            currentQuestion?.difficulty === 'easy' ? "border-green-200 text-green-700 bg-green-50" :
                                            currentQuestion?.difficulty === 'medium' ? "border-amber-200 text-amber-700 bg-amber-50" :
                                            "border-red-200 text-red-700 bg-red-50"
                                        )}>
                                            {currentQuestion?.difficulty}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Question Text Area - Scrollable Fix */}
                                <div className="flex-grow relative min-h-0">
                                    <div className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Quote Icon Watermark - Fixed position relative to content */}
                                        <div className="absolute -top-2 -left-2 text-slate-100 text-8xl font-serif leading-none select-none pointer-events-none transform -translate-y-4 -z-10">
                                            <Quote className="h-20 w-20 text-slate-50 fill-current opacity-50" />
                                        </div>
                                        
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug tracking-tight relative z-10">
                                            {displayedQuestion}
                                            {isTyping && (
                                                <span className="inline-block w-3 h-8 ml-1.5 align-sub bg-primary animate-pulse rounded-sm" />
                                            )}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* Background decoration */}
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-tl-full opacity-50 pointer-events-none" />
                        </Card>

                        {/* Answer Input Area */}
                        <Card className={cn(
                            "flex-grow flex flex-col shadow-lg shadow-slate-200/40 border-0 rounded-3xl relative overflow-hidden bg-white transition-all duration-300 ring-1 ring-slate-200",
                            isListening ? "ring-2 ring-purple-500/50 shadow-purple-100" : "focus-within:ring-2 focus-within:ring-primary/20"
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
                                        <Button
                                            size="icon"
                                            variant={isListening ? "destructive" : "default"}
                                            className={cn(
                                                "relative rounded-full h-14 w-14 shadow-xl transition-all duration-500 border border-slate-100",
                                                isListening 
                                                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 ring-4 ring-red-500/20" 
                                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                                            )}
                                            onClick={toggleListening}
                                        >
                                            {isListening ? (
                                                <MicOff className="h-6 w-6" />
                                            ) : (
                                                <Mic className="h-6 w-6" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Improved Footer with Breathing Room */}
                            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center backdrop-blur-md">
                                <div className="text-xs text-slate-400 font-medium pl-1">
                                    {currentAnswer.length} chars
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleSkip}
                                        disabled={isSubmitting}
                                        className="text-slate-500 hover:text-slate-900 gap-2 h-11"
                                    >
                                        <SkipForward className="h-4 w-4" /> Skip
                                    </Button>
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isSubmitting}
                                        className="px-8 h-11 shadow-lg shadow-primary/20 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
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

            <AlertDialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End Interview Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave? Your current interview progress will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            End Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default InterviewCoach;