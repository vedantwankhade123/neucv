import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InterviewData } from '@/types/interview';
import { ArrowLeft, Download, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLanguageDisplayName, formatDuration } from '@/lib/interview-service';
import { Logo } from '@/components/Logo';
import { UserNav } from '@/components/UserNav';

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
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handleDownloadReport = () => {
        // Create a simple text report
        const reportText = `
INTERVIEW PERFORMANCE REPORT
============================

Job Role: ${setupData.jobRole}
Date: ${new Date(startTime).toLocaleString()}
Duration: ${formatDuration(totalDuration)}
Language: ${getLanguageDisplayName(setupData.language)}

OVERALL SCORE: ${overallScore}/100

STRENGTHS:
${report?.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'N/A'}

AREAS FOR IMPROVEMENT:
${report?.areasForImprovement.map((a, i) => `${i + 1}. ${a}`).join('\n') || 'N/A'}

RECOMMENDATIONS:
${report?.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'N/A'}

QUESTION-BY-QUESTION ANALYSIS:
${questions.map((q, i) => {
            const resp = responses[i];
            return `
Question ${i + 1}: ${q.question}
Category: ${q.category} | Difficulty: ${q.difficulty}
Your Answer: ${resp?.answer || 'No response'}
Score: ${resp?.evaluation?.score || 'N/A'}/100
Feedback: ${resp?.evaluation?.feedback || 'N/A'}
`;
        }).join('\n---\n')}
        `.trim();

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${setupData.jobRole.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b px-6 py-4 flex-shrink-0 no-print">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Interview Coach</h1>
                            <p className="text-xs text-muted-foreground">
                                {setupData.jobRole} • {new Date(startTime).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Overall Score */}
                    <Card className="overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Overall Performance</p>
                                    <h2 className="text-6xl font-bold mt-2">{overallScore}<span className="text-3xl opacity-75">/100</span></h2>
                                    <p className="text-lg opacity-90 mt-2 font-medium">
                                        {overallScore >= 80 ? 'Excellent work!' : overallScore >= 60 ? 'Good effort!' : 'Keep practicing!'}
                                    </p>
                                </div>
                                <div className="hidden md:flex w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center">
                                    <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-inner">
                                        <Sparkles className="h-12 w-12 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                                    <p className="text-xl font-semibold">{formatDuration(totalDuration)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Questions</p>
                                    <p className="text-xl font-semibold">{questions.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Language</p>
                                    <p className="text-xl font-semibold capitalize">{getLanguageDisplayName(setupData.language)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Avg. Time/Question</p>
                                    <p className="text-xl font-semibold">{Math.round(totalDuration / questions.length)}s</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance by Category */}
                    {report?.performanceByCategory && report.performanceByCategory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance by Category</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {report.performanceByCategory.map((cat, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{cat.category}</span>
                                            <span className={cn("font-bold", getScoreColor(cat.score))}>
                                                {cat.score}/100
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500", getScoreBgColor(cat.score))}
                                                style={{ width: `${cat.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Strengths and Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-green-100 dark:border-green-900/20 bg-green-50/30 dark:bg-green-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <TrendingUp className="h-5 w-5" />
                                    Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report?.strengths.map((strength, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                            <span className="text-sm text-foreground/90">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-100 dark:border-orange-900/20 bg-orange-50/30 dark:bg-orange-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                    <TrendingDown className="h-5 w-5" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report?.areasForImprovement.map((area, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                            <span className="text-sm text-foreground/90">{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    {report?.recommendations && report.recommendations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-xs font-bold text-primary">{i + 1}</span>
                                            </div>
                                            <span className="text-sm">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Question-by-Question Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Question Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {questions.map((q, i) => {
                                const resp = responses[i];
                                const score = resp?.evaluation?.score || 0;

                                return (
                                    <div key={q.id} className="pb-8 border-b last:border-0 last:pb-0">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-lg">Question {i + 1}</span>
                                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-medium">
                                                        {q.category}
                                                    </span>
                                                    <span className={cn(
                                                        "text-xs px-2.5 py-0.5 rounded-full font-medium",
                                                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    )}>
                                                        {q.difficulty}
                                                    </span>
                                                </div>
                                                <p className="text-base font-medium leading-relaxed">{q.question}</p>
                                            </div>
                                            <div className={cn("text-3xl font-bold ml-6", getScoreColor(score))}>
                                                {score}
                                            </div>
                                        </div>

                                        {resp?.answer && (
                                            <div className="mb-4 p-4 bg-muted/50 rounded-xl border">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Answer</p>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{resp.answer}</p>
                                            </div>
                                        )}

                                        {resp?.evaluation && (
                                            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Feedback</p>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{resp.evaluation.feedback}</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {resp.evaluation.strengths && resp.evaluation.strengths.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wider">
                                                                Strengths
                                                            </p>
                                                            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                                                {resp.evaluation.strengths.map((s, idx) => (
                                                                    <li key={idx}>{s}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {resp.evaluation.improvements && resp.evaluation.improvements.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wider">
                                                                Improvements
                                                            </p>
                                                            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                                                {resp.evaluation.improvements.map((imp, idx) => (
                                                                    <li key={idx}>{imp}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="bg-muted/30">
                        <CardContent className="p-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <Button size="lg" onClick={onNewInterview} className="w-full sm:w-auto min-w-[200px]">
                                Start New Interview
                            </Button>
                            <Button size="lg" variant="outline" onClick={onBackToDashboard} className="w-full sm:w-auto min-w-[200px]">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
