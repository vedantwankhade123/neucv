import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Play, Square, Volume2, VolumeX, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

interface Question {
    id: number;
    question: string;
    category: string;
    answered: boolean;
}

const InterviewCoach = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [activeTab, setActiveTab] = useState<'questions' | 'timeline' | 'highlights'>('questions');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isAISpeaking, setIsAISpeaking] = useState(false);

    const [questions] = useState<Question[]>([
        {
            id: 1,
            question: "Tell me about yourself and your background.",
            category: "Introduction",
            answered: false
        },
        {
            id: 2,
            question: "What interests you about this position?",
            category: "Motivation",
            answered: false
        },
        {
            id: 3,
            question: "Describe a challenging project you've worked on.",
            category: "Experience",
            answered: false
        },
        {
            id: 4,
            question: "How do you handle tight deadlines and pressure?",
            category: "Behavioral",
            answered: false
        },
        {
            id: 5,
            question: "What are your strengths and weaknesses?",
            category: "Self-Assessment",
            answered: false
        }
    ]);

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

    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Simulate AI speaking
    useEffect(() => {
        if (isRecording) {
            const interval = setInterval(() => {
                setIsAISpeaking(prev => !prev);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isRecording]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Interview Coach</h1>
                            <p className="text-sm text-slate-500">AI-powered interview practice session</p>
                        </div>
                    </div>
                    <Logo />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Panel */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* AI Interviewer Video */}
                        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 aspect-video rounded-2xl">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className={cn(
                                        "w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto transition-all duration-300",
                                        isAISpeaking && isRecording && "ring-4 ring-white/50 scale-110"
                                    )}>
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center">
                                            <span className="text-4xl font-bold">AI</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Your AI Interview Coach</h3>
                                    <p className="text-white/80 text-sm">
                                        {isRecording ? "Listening to your response..." : "Ready to start your practice session"}
                                    </p>
                                </div>
                            </div>
                            <div className="absolute top-4 left-4">
                                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        isRecording ? "bg-red-500 animate-pulse" : "bg-white/50"
                                    )} />
                                    {isRecording ? "Recording" : "Standby"}
                                </div>
                            </div>
                        </Card>

                        {/* Your Video */}
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
                            <div className="absolute top-4 left-4">
                                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-sm font-medium">
                                    You
                                </div>
                            </div>

                            {/* Controls */}
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

                                <div className="w-px h-8 bg-white/20" />

                                <Button
                                    onClick={toggleRecording}
                                    size="icon"
                                    className={cn(
                                        "w-14 h-14 rounded-full shadow-lg transition-all",
                                        isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
                                    )}
                                >
                                    {isRecording ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/30"
                                >
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Question Panel */}
                    <div className="space-y-4">
                        {/* Tabs */}
                        <Card className="p-1">
                            <div className="grid grid-cols-3 gap-1">
                                <button
                                    onClick={() => setActiveTab('questions')}
                                    className={cn(
                                        "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        activeTab === 'questions'
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Questions
                                </button>
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={cn(
                                        "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        activeTab === 'timeline'
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Timeline
                                </button>
                                <button
                                    onClick={() => setActiveTab('highlights')}
                                    className={cn(
                                        "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        activeTab === 'highlights'
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Feedback
                                </button>
                            </div>
                        </Card>

                        {/* Question List */}
                        {activeTab === 'questions' && (
                            <Card className="p-4 max-h-[600px] overflow-y-auto">
                                <div className="space-y-3">
                                    {questions.map((q, index) => (
                                        <div
                                            key={q.id}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                currentQuestionIndex === index
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0",
                                                    q.answered ? "bg-green-500 text-white" : "bg-primary/10 text-primary"
                                                )}>
                                                    {q.answered ? <CheckCircle2 className="h-4 w-4" /> : String(q.id).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm mb-2">{q.question}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {q.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'timeline' && (
                            <Card className="p-6 text-center text-muted-foreground">
                                <p>Interview timeline will appear here during the session</p>
                            </Card>
                        )}

                        {activeTab === 'highlights' && (
                            <Card className="p-6 text-center text-muted-foreground">
                                <p>AI feedback and highlights will appear after the interview</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InterviewCoach;
