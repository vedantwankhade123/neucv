import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

interface PromptGenerationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (prompt: string) => Promise<void>;
    isGenerating: boolean;
}

export function PromptGenerationDialog({
    open,
    onOpenChange,
    onGenerate,
    isGenerating,
}: PromptGenerationDialogProps) {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = async () => {
        if (prompt.trim()) {
            await onGenerate(prompt);
            setPrompt(''); // Clear after generating
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Generate Cover Letter with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe the cover letter you want to create, and our AI will generate it for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="prompt" className="text-sm font-medium">
                            Your Prompt
                        </Label>
                        <Textarea
                            id="prompt"
                            placeholder="Example: Write a cover letter for a Senior Software Engineer position at Google. I have 5 years of experience in React and Node.js, and I'm passionate about building scalable web applications. Highlight my leadership skills and mention that I led a team of 5 developers in my previous role."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={8}
                            className="resize-none"
                            disabled={isGenerating}
                        />
                        <p className="text-xs text-muted-foreground">
                            Be as specific as possible. Include details about the position, company, your experience, and what you want to emphasize.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-blue-900">💡 Tips for better results:</p>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Mention the job position and company name</li>
                            <li>Include your relevant experience and skills</li>
                            <li>State what makes you unique or passionate about the role</li>
                            <li>Mention any specific achievements you want to highlight</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
