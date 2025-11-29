import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InterviewData } from '@/types/interview';
import { ArrowLeft, Download, CheckCircle2, AlertCircle, Clock, FileText, BarChart3, ChevronDown, ChevronUp, RefreshCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLanguageDisplayName, formatDuration } from '@/lib/interview-service';
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
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const handleDownloadReport = () => {
        const reportText = `
INTERVIEW PERFORMANCE REPORT
============================
Job Role: ${setupData.jobRole}
Date: ${new Date(startTime).toLocaleString()}
Overall Score: ${overallScore}/100

STRENGTHS:
${report?.strengths.map(s => `- ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${report?.areasForImprovement.map(a => `- ${a}`).join('\n')}

RECOMMENDATIONS:
${report?.recommendations.map(r => `- ${r}`).join('\n')}
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
        <div className="flex flex-col h-screen bg-background font-sans">
            {/* Header */}
            <header className="h-16 border-b px-6 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBackToDashboard}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Interview Report</h1>
                        <p className="text-xs text-muted-foreground">{setupData.jobRole} • {new Date(startTime).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <UserNav />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Score Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Score Card */}
                        <Card className="col-span-1 md:col-span-2 border-primary/10 shadow-md bg-gradient-to-br from-white to-primary/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                                strokeDasharray={351.86} 
                                                strokeDashoffset={351.86 - (351.86 * overallScore) / 100}
                                                className={cn("transition-all duration-1000 ease-out", overallScore >= 80 ? "text-green-500" : overallScore >= 60 ? "text-yellow-500" : "text-red-500")} 
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-bold">{overallScore}</span>
                                            <span className="text-xs text-muted-foreground font-medium">SCORE</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">
                                            {overallScore >= 80 ? 'Outstanding!' : overallScore >= 60 ? 'Good Job!' : 'Needs Practice'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            {overallScore >= 80 
                                                ? "You demonstrated strong competency and communication skills tailored to the role."
                                                : overallScore >= 60
                                                ? "You have a solid foundation but there are specific areas to refine for a top-tier performance."
                                                : "Focus on structuring your answers better and deepening your technical explanations."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col gap-4 w-full sm:w-auto border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Clock className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Duration</p>
                                            <p className="font-semibold">{formatDuration(totalDuration)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><FileText className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Questions</p>
                                            <p className="font-semibold">{questions.length} Answered</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><BarChart3 className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Difficulty</p>
                                            <p className="font-semibold capitalize">Mixed</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown */}
                        <Card className="col-span-1 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Skill Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {report?.performanceByCategory.map((cat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1.5 text-sm">
                                            <span className="font-medium">{cat.category}</span>
                                            <span className={cn("font-bold", getScoreColor(cat.score))}>{cat.score}%</span>
                                        </div>
                                        <Progress value={cat.score} className="h-2" indicatorClassName={cn(cat.score >= 80 ? "bg-green-500" : cat.score >= 60 ? "bg-yellow-500" : "bg-red-500")} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feedback Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-l-4 border-l-green-500 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Trophy className="h-5 w-5 text-green-600" /> Key Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report?.strengths.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-foreground/90">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <AlertCircle className="h-5 w-5 text-orange-600" /> Growth Areas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report?.areasForImprovement.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-foreground/90">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Analysis Accordion */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">Question Analysis</h2>
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {questions.map((q, i) => {
                                const resp = responses[i];
                                const score = resp?.evaluation?.score || 0;
                                return (
                                    <AccordionItem key={q.id} value={q.id} className="border rounded-lg bg-white shadow-sm px-4">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-4 text-left w-full pr-4">
                                                <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0 border-slate-300 text-slate-500">
                                                    {i + 1}
                                                </Badge>
                                                <div className="flex-1">
                                                    <p className="font-medium text-base line-clamp-1">{q.question}</p>
                                                </div>
                                                <Badge variant="secondary" className={cn("ml-auto pointer-events-none", getScoreBg(score))}>
                                                    {score}/100
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-0 pb-4">
                                            <Separator className="mb-4" />
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</h4>
                                                    <p className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-md italic">
                                                        "{resp?.answer}"
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feedback</h4>
                                                    <p className="text-sm text-foreground/90 leading-relaxed">
                                                        {resp?.evaluation?.feedback}
                                                    </p>
                                                    {resp?.evaluation?.improvements && resp.evaluation.improvements.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-dashed">
                                                            <p className="text-xs font-medium text-orange-600 mb-1">Quick Tip:</p>
                                                            <p className="text-xs text-muted-foreground">{resp.evaluation.improvements[0]}</p>
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 pb-12">
                        <Button size="lg" onClick={onNewInterview} className="shadow-md hover:shadow-lg transition-all min-w-[200px]">
                            <RefreshCw className="mr-2 h-4 w-4" /> Start New Session
                        </Button>
                        <Button size="lg" variant="outline" onClick={onBackToDashboard} className="min-w-[200px]">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}