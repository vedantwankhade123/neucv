import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreditRulesDialogProps {
    trigger: React.ReactNode;
    mode?: 'resume' | 'interview' | 'all';
}

export function CreditRulesDialog({ trigger, mode = 'all' }: CreditRulesDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Credit System Details</DialogTitle>
                    <DialogDescription>
                        Understanding how credits are allocated and used.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-1 text-primary">Monthly Allocation</h4>
                            <p className="text-sm text-muted-foreground">
                                You receive <strong>25 free credits</strong> every month. These credits reset on your billing cycle date. Unused credits do not roll over.
                            </p>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2 text-primary">Usage Costs</h4>
                            <ul className="space-y-3 text-sm">
                                {(mode === 'all' || mode === 'resume') && (
                                    <li>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Resume AI Generation</span>
                                            <span className="font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-xs">1 Credit</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Includes generating summaries, experience descriptions, skills, and custom section content.
                                        </p>
                                    </li>
                                )}
                                {(mode === 'all' || mode === 'interview') && (
                                    <li>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Interview Coach Session</span>
                                            <span className="font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-xs">5 Credits</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Includes a full mock interview session and a detailed AI-generated feedback report.
                                        </p>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-1 text-primary">Insufficient Credits?</h4>
                            <p className="text-sm text-muted-foreground">
                                If you run out of credits, you can use your own <strong>Gemini API Key</strong> in Settings to continue using AI features for free.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
