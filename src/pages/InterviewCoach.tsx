import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Square, Volume2, Loader2, CheckCircle2, ArrowRight, User, Clock, ChevronRight } from 'lucide-react';
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

type InterviewPhase = 'interview' | 'report';

const InterviewCoach = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);

    // Initial state from location
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [phase, setPhase] = useState<InterviewPhase>('interview');

    // Media controls
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(true);
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
            // Auto-start video
            toggleVideo();
        } else {
            // Redirect to setup if no data
            navigate('/dashboard/interview');
        }
    }, [location.state, navigate]);

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
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [phase]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Error starting speech recognition:", e);
                setIsListening(true);
            }
        }
    };

    // Submit answer handler
    const handleSubmitAnswer = async () => {
        if (!interviewData) return;
        
        if (isListening) {
            toggleListening();
        }

        if (!currentAnswer.trim()) {
            toast({
                title: 'No Answer Provided',
                description: 'Please speak or type your answer before submitting.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmittingAnswer(true);

        try {
            const currentQuestion = interviewData.questions[currentQuestionIndex];
            const questionDuration = Math.floor((Date.now() - questionStartTime) / 1000);

            // Create response object (evaluation deferred)
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
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentAnswer('');
                setQuestionStartTime(Date.now());

                toast({
                    title: 'Answer Saved',
                    description: 'Moving to next question...'
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

    const handleEndInterviewEarly = async () => {
        if (!interviewData) return;
        
        if (confirm("Are you sure you want to end the interview early? We will evaluate the questions answered so far.")) {
            if (isListening) toggleListening();
            await completeInterview(interviewData);
        }
    };

    const completeInterview = async (finalData: InterviewData) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsVideoOn(false);
        }

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
                    
                    evaluatedResponses.push({
                        ...response,
                        evaluation
                    });
                } else {
                    evaluatedResponses.push(response);
                }
            }

            setAnalysisProgress(60);

            const dataWithEvaluations = {
                ...finalData,
                responses: evaluatedResponses
            };

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

            toast({
                title: 'Analysis Complete',
                description: 'Your comprehensive interview report is ready.'
            });
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast({
                title: 'Report Generation Failed',
                description: 'Showing raw results. Please try again later.',
                variant: 'destructive'
            });

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

    // Timer
    useEffect(() => {
        if (phase === 'interview' && interviewData) {
            timerIntervalRef.current = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - interviewData.startTime) / 1000);
                setElapsedTime(elapsed);

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

    // Cleanup
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [stream]);

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
    const timeLimit = interviewData!.setupData.duration * 60;
    const timeRemaining = Math.max(0, timeLimit - elapsedTime);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Immersive Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 shadow-sm z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Mock Interview</h1>
                            <p className="text-xs text-muted-foreground font-medium mt-1">{interviewData!.setupData.jobRole}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Time Remaining</span>
                            <div className={cn(
                                "flex items-center gap-1.5 font-mono font-bold text-lg leading-none",
                                timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-slate-700"
                            )}>
                                <Clock className="h-4 w-4" />
                                {formatDuration(timeRemaining)}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleEndInterviewEarly}
                            className="shadow-sm hover:shadow-md transition-all"
                        >
                            <Square className="mr-2 h-3 w-3 fill-current" /> End Session
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50">
                <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
                    {/* Progress Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">Question {currentQuestionIndex + 1}</span>
                            <span className="text-xs text-muted-foreground">of {interviewData!.questions.length}</span>
                        </div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                            <span className="text-xs font-bold text-slate-700">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                        {/* Left Column: Question & Answer */}
                        <div className="flex flex-col gap-4 h-full min-h-[400px]">
                            {/* Question Card */}
                            <Card className="p-6 md:p-8 bg-white border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                        {currentQuestion.category}
                                    </Badge>
                                    <Badge variant="outline" className={cn(
                                        "border-slate-200",
                                        currentQuestion.difficulty === 'hard' ? "text-red-600 bg-red-50" :
                                        currentQuestion.difficulty === 'medium' ? "text-yellow-600 bg-yellow-50" :
                                        "text-green-600 bg-green-50"
                                    )}>
                                        {currentQuestion.difficulty}
                                    </Badge>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed tracking-tight">
                                    {currentQuestion.question}
                                </h2>
                            </Card>

                            {/* Answer Area */}
                            <Card className="flex-grow flex flex-col shadow-sm border-slate-200 relative overflow-hidden bg-white">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                                        <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-widest">Your Response</h3>
                                    </div>
                                    <Button
                                        variant={isListening ? "destructive" : "default"}
                                        size="sm"
                                        onClick={toggleListening}
                                        className={cn(
                                            "transition-all duration-300 shadow-sm", 
                                            isListening ? "animate-pulse" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {isListening ? (
                                            <>
                                                <MicOff className="h-3.5 w-3.5 mr-2" /> Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="h-3.5 w-3.5 mr-2" /> Start Recording
                                            </>
                                        )}
                                    </Button>
                                </div>
                                
                                <div className="relative flex-grow">
                                    <Textarea
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        placeholder="Type your answer here or click 'Start Recording' to speak..."
                                        className="h-full resize-none border-0 focus-visible:ring-0 text-base p-6 leading-relaxed bg-transparent text-slate-800 placeholder:text-slate-400"
                                        disabled={isSubmittingAnswer}
                                    />
                                    {isListening && (
                                        <div className="absolute bottom-6 right-6 flex items-center gap-3 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                            Recording...
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                                        {currentAnswer.length} characters
                                    </div>
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isSubmittingAnswer}
                                        className="px-6 shadow-md hover:shadow-lg transition-all"
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
                            </Card>
                        </div>

                        {/* Right Column: Video Preview & Tips */}
                        <div className="flex flex-col h-full gap-4">
                            <Card className="flex-grow bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-slate-800 relative group min-h-[300px]">
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
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-md">
                                        <div className="w-24 h-24 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 border-4 border-slate-700/50 shadow-2xl">
                                            <User className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <p className="text-slate-400 font-medium tracking-wide">Camera Disabled</p>
                                    </div>
                                )}

                                {/* Camera Controls Overlay */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-20">
                                    <Button
                                        onClick={toggleVideo}
                                        size="icon"
                                        className={cn(
                                            "w-12 h-12 rounded-full border-2 transition-all hover:scale-110 shadow-lg",
                                            isVideoOn 
                                                ? "bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md" 
                                                : "bg-red-500 hover:bg-red-600 border-red-500 text-white"
                                        )}
                                        title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                                    >
                                        {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                    </Button>

                                    <Button
                                        onClick={toggleAudio}
                                        size="icon"
                                        className={cn(
                                            "w-12 h-12 rounded-full border-2 transition-all hover:scale-110 shadow-lg",
                                            isAudioOn 
                                                ? "bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md" 
                                                : "bg-red-500 hover:bg-red-600 border-red-500 text-white"
                                        )}
                                        title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
                                    >
                                        {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </Card>
                            
                            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                                <div className="flex gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg h-fit">
                                        <Volume2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-blue-900 mb-1">Coach's Tip</h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Structure your answer using the <strong>STAR method</strong> (Situation, Task, Action, Result) for behavioral questions. Be specific about your contributions.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Analysis Overlay */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <Card className="p-10 text-center max-w-md shadow-2xl border-none bg-white ring-1 ring-slate-200">
                        <div className="relative mb-8 mx-auto w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-r-4 border-purple-500 animate-spin animation-delay-150"></div>
                            <div className="absolute inset-4 rounded-full border-b-4 border-blue-500 animate-spin animation-delay-300"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Analyzing Performance</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                            Analyzing your performance, checking technical accuracy, and preparing detailed feedback...
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{analysisProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 rounded-full"
                                    style={{ width: `${analysisProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;