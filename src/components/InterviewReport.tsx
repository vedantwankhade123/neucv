import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InterviewData } from '@/types/interview';
import { ArrowLeft, Download, CheckCircle2, AlertCircle, Clock, FileText, BarChart3, Trophy, ArrowUpRight, Target, Sparkles, User, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/interview-service';
import { UserNav } from '@/components/UserNav';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface InterviewReportProps {
    interviewData: InterviewData;
    onNewInterview: () => void;
    onBackToDashboard: () => void;
}

export function InterviewReport({ interviewData, onNewInterview, onBackToDashboard }: InterviewReportProps) {
    const { setupData, questions, responses, report, startTime, endTime } = interviewData;

    const totalDuration = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    const overallScore = report?.overallScore || 0;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const handleDownloadReport = () => {
        const reportText = `
INTERVIEW PERFORMANCE REPORT
============================
Job Role: ${setupData.jobRole}
Date: ${new Date(startTime).toLocaleString()}
Overall Score: ${overallScore}/100

STRENGTHS:
${report?.strengths?.map(s => `- ${s}`).join('\n') || 'No strengths analyzed.'}

AREAS FOR IMPROVEMENT:
${report?.areasForImprovement?.map(a => `- ${a}`).join('\n') || 'No improvements analyzed.'}

RECOMMENDATIONS:
${report?.recommendations?.map(r => `- ${r}`).join('\n') || 'No recommendations available.'}
        `.trim();

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBackToDashboard} className="hover:bg-slate-50">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900">Performance Report</h1>
                        <p className="text-xs text-slate-500 font-medium">{setupData.jobRole} • {new Date(startTime).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleDownloadReport} className="border-slate-200 text-slate-700">
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                    <UserNav />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Score Card */}
                        <Card className="md:col-span-1 border-none shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-purple-500"></div>
                            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                            strokeDasharray={402} 
                                            strokeDashoffset={402 - (402 * overallScore) / 100}
                                            className={cn("transition-all duration-1000 ease-out", overallScore >= 80 ? "text-green-500" : overallScore >= 60 ? "text-amber-500" : "text-red-500")} 
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold text-slate-900">{overallScore}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        {overallScore >= 80 ? 'Excellent Performance!' : overallScore >= 60 ? 'Good Effort!' : 'Needs Improvement'}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {overallScore >= 80 ? "You're ready for the real interview." : "Review the feedback below to improve."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Grid */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <Card className="border-slate-100 shadow-sm bg-white p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-50 text-slate-600">Time</Badge>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-slate-900">{formatDuration(totalDuration)}</span>
                                    <p className="text-xs text-slate-500 mt-1">Total interview duration</p>
                                </div>
                            </Card>

                            <Card className="border-slate-100 shadow-sm bg-white p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-50 text-slate-600">Content</Badge>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-slate-900">{questions.length}</span>
                                    <p className="text-xs text-slate-500 mt-1">Questions answered</p>
                                </div>
                            </Card>

                            <Card className="col-span-2 border-slate-100 shadow-sm bg-white p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900">Skill Breakdown</h3>
                                </div>
                                <div className="space-y-4">
                                    {report?.performanceByCategory?.length ? report.performanceByCategory.map((cat, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-slate-600 w-32 truncate">{cat.category}</span>
                                            <Progress value={cat.score} className="h-2 flex-1 bg-slate-100" indicatorClassName={cn(cat.score >= 80 ? "bg-green-500" : cat.score >= 60 ? "bg-amber-500" : "bg-red-500")} />
                                            <span className={cn("text-sm font-bold w-10 text-right", getScoreColor(cat.score))}>{cat.score}%</span>
                                        </div>
                                    )) : (
                                        <div className="text-sm text-slate-400 italic">No category data available</div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                                    <Trophy className="h-5 w-5 text-green-600" /> Top Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report?.strengths?.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-700 bg-white/60 p-3 rounded-lg border border-green-100/50">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    )) || <li className="text-sm text-slate-500 italic">Analysis unavailable</li>}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md bg-gradient-to-br from-white to-amber-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                                    <Target className="h-5 w-5 text-amber-600" /> Focus Areas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report?.areasForImprovement?.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-700 bg-white/60 p-3 rounded-lg border border-amber-100/50">
                                            <ArrowUpRight className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    )) || <li className="text-sm text-slate-500 italic">Analysis unavailable</li>}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="border-slate-100 shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="h-5 w-5 text-purple-500" /> Actionable Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {report?.recommendations?.map((rec, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 flex items-start gap-3">
                                        <div className="bg-white p-1.5 rounded-full shadow-sm text-xs font-bold text-slate-400 border border-slate-100">
                                            {i + 1}
                                        </div>
                                        <p className="mt-0.5 leading-relaxed">{rec}</p>
                                    </div>
                                )) || <div className="text-sm text-slate-500 italic">Analysis unavailable</div>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Q&A Breakdown */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-900 px-1">Detailed Analysis</h2>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {questions.map((q, i) => {
                                const resp = responses[i];
                                const score = resp?.evaluation?.score || 0;
                                return (
                                    <AccordionItem key={q.id} value={q.id} className="border border-slate-200 rounded-xl bg-white shadow-sm px-2 overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-primary/20">
                                        <AccordionTrigger className="hover:no-underline py-4 px-4">
                                            <div className="flex items-center gap-4 text-left w-full pr-4">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border",
                                                    score >= 80 ? "bg-green-50 text-green-700 border-green-200" :
                                                    score >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    "bg-red-50 text-red-700 border-red-200"
                                                )}>
                                                    {score}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-base text-slate-900 line-clamp-1">{q.question}</p>
                                                </div>
                                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200" />
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-0 pb-6 px-4">
                                            <Separator className="mb-6 bg-slate-100" />
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <User className="h-3 w-3" /> Your Response
                                                    </h4>
                                                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed italic border border-slate-100 relative">
                                                        <span className="absolute top-2 left-2 text-4xl text-slate-200 font-serif leading-none opacity-50">"</span>
                                                        <span className="relative z-10">{resp?.answer || "No answer provided."}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Sparkles className="h-3 w-3" /> AI Feedback
                                                    </h4>
                                                    <div className="text-sm text-slate-700 leading-relaxed">
                                                        {resp?.evaluation?.feedback || "Feedback not available."}
                                                    </div>
                                                    {resp?.evaluation?.improvements && resp.evaluation.improvements.length > 0 && (
                                                        <div className="mt-4 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                                                            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                                                                <AlertCircle className="h-3 w-3" /> Improvement Tip
                                                            </p>
                                                            <p className="text-xs text-amber-800/80">{resp.evaluation.improvements[0]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 pb-12">
                        <Button size="lg" onClick={onNewInterview} className="shadow-lg hover:shadow-xl transition-all min-w-[200px] h-12 text-base">
                            <RefreshCw className="mr-2 h-4 w-4" /> Start New Session
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}