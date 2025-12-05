import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Key, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface InsufficientCreditsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentCredits: number;
    requiredCredits: number;
    nextResetDate?: string;
}

export function InsufficientCreditsDialog({
    open,
    onOpenChange,
    currentCredits,
    requiredCredits,
    nextResetDate
}: InsufficientCreditsDialogProps) {
    const navigate = useNavigate();
    const hasApiKey = !!localStorage.getItem('gemini_api_key');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] p-0 gap-0 sm:rounded-lg bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black dark:bg-white rounded-lg flex-shrink-0">
                            <Zap className="h-5 w-5 text-white dark:text-black" />
                        </div>
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-black dark:text-white leading-tight">
                            Insufficient Credits
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pt-2.5 sm:pt-3 leading-relaxed">
                        You need <strong className="font-semibold text-black dark:text-white">{requiredCredits} credits</strong> to start an interview session, but you currently have <strong className="font-semibold text-black dark:text-white">{currentCredits} credits</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
                    {/* Monthly Reset Info */}
                    <div className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-black dark:text-white mb-1.5 leading-tight">
                                    Monthly Credit Reset
                                </h4>
                                <p className="text-sm text-black dark:text-white leading-relaxed break-words">
                                    {nextResetDate 
                                        ? `Your credits will reset to 25 on ${nextResetDate}.`
                                        : "Your credits reset monthly to give you 25 free credits each month."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Key Option */}
                    {hasApiKey ? (
                        <div className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg">
                            <div className="flex items-start gap-3">
                                <Key className="h-5 w-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-black dark:text-white mb-1.5 leading-tight">
                                        Use Your API Key
                                    </h4>
                                    <p className="text-sm text-black dark:text-white leading-relaxed break-words">
                                        You have an API key saved. Enable "Use Key" in Settings to use your personal API key for unlimited interviews without using credits.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg">
                            <div className="flex items-start gap-3">
                                <Key className="h-5 w-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-black dark:text-white mb-1.5 leading-tight">
                                        Add Your API Key
                                    </h4>
                                    <p className="text-sm text-black dark:text-white mb-2.5 leading-relaxed break-words">
                                        Use your own Google Gemini API key for unlimited interviews without using credits.
                                    </p>
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-black dark:text-white hover:underline font-semibold inline-flex items-center gap-1.5 transition-colors border-b border-black dark:border-white"
                                    >
                                        Get Free API Key <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto order-2 sm:order-1 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            navigate('/settings');
                        }}
                        className="w-full sm:w-auto order-1 sm:order-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 border-2 border-black dark:border-white"
                    >
                        Go to Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

