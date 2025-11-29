import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Square, Volume2, Loader2, CheckCircle2, ArrowRight, User } from 'lucide-react';
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
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex-shrink-0 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">Mock Interview</h1>
                            <p className="text-xs text-muted-foreground font-medium">{interviewData!.setupData.jobRole}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Time Remaining</span>
                            <div className={cn(
                                "font-mono font-bold text-lg leading-none",
                                timeRemaining < 300 ? "text-red-600 animate-pulse" : "text-slate-700"
                            )}>
                                {formatDuration(timeRemaining)}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <Button variant="destructive" size="sm" onClick={handleEndInterviewEarly}>
                            <Square className="mr-2 h-3 w-3 fill-current" /> End Interview
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm">
                        <span className="text-sm font-semibold text-slate-700">Question {currentQuestionIndex + 1} of {interviewData!.questions.length}</span>
                        <div className="flex-1 mx-6 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-500 ease-out rounded-full" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">{Math.round(progress)}% Complete</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                        {/* Question Panel */}
                        <div className="flex flex-col gap-4 h-full">
                            <Card className="p-6 bg-white border-l-4 border-l-primary shadow-md">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">{currentQuestion.category}</Badge>
                                    <Badge variant="outline" className="text-muted-foreground border-slate-300">{currentQuestion.difficulty}</Badge>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                                    {currentQuestion.question}
                                </h2>
                            </Card>

                            <Card className="flex-grow flex flex-col p-4 shadow-md bg-white border-slate-200 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Your Answer</h3>
                                    <Button
                                        variant={isListening ? "destructive" : "secondary"}
                                        size="sm"
                                        onClick={toggleListening}
                                        className={cn("transition-all duration-300 gap-2", isListening && "animate-pulse")}
                                    >
                                        {isListening ? (
                                            <>
                                                <MicOff className="h-4 w-4" /> Stop Listening
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="h-4 w-4" /> Start Speaking
                                            </>
                                        )}
                                    </Button>
                                </div>
                                
                                <div className="relative flex-grow">
                                    <Textarea
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        placeholder="Type your answer here or click 'Start Speaking'..."
                                        className="h-full resize-none border-slate-200 focus-visible:ring-primary/20 text-base p-4"
                                        disabled={isSubmittingAnswer}
                                    />
                                    {isListening && (
                                        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold animate-pulse pointer-events-none">
                                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                            Listening...
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {currentAnswer.length} characters
                                    </span>
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || isSubmittingAnswer}
                                        className="w-32 shadow-lg shadow-primary/20"
                                    >
                                        {isSubmittingAnswer ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Submit <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Video Panel */}
                        <div className="flex flex-col h-full">
                            <Card className="flex-grow bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-slate-800 relative group">
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
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4 border-4 border-slate-700 shadow-2xl">
                                            <User className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <p className="text-slate-400 font-medium">Camera is off</p>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex items-center justify-center gap-4">
                                        <Button
                                            onClick={toggleVideo}
                                            size="icon"
                                            className={cn(
                                                "w-12 h-12 rounded-full border-2 transition-transform hover:scale-110",
                                                isVideoOn 
                                                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
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
                                                "w-12 h-12 rounded-full border-2 transition-transform hover:scale-110",
                                                isAudioOn 
                                                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                                                    : "bg-red-500 hover:bg-red-600 border-red-500 text-white"
                                            )}
                                            title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
                                        >
                                            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                            
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex gap-3 items-start">
                                <div className="bg-blue-200 p-1.5 rounded-full mt-0.5">
                                    <Volume2 className="h-3.5 w-3.5 text-blue-700" />
                                </div>
                                <p className="leading-relaxed">
                                    <strong>Pro Tip:</strong> Speak clearly and structure your answer using the STAR method (Situation, Task, Action, Result) for behavioral questions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Analysis Overlay */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <Card className="p-10 text-center max-w-md shadow-2xl border-none bg-white/95">
                        <div className="relative mb-6 mx-auto w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-r-4 border-purple-500 animate-spin animation-delay-150"></div>
                            <div className="absolute inset-4 rounded-full border-b-4 border-blue-500 animate-spin animation-delay-300"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Analyzing Performance</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Our AI is evaluating your responses and preparing detailed feedback...
                        </p>
                        {analysisProgress > 0 && (
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${analysisProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default InterviewCoach;