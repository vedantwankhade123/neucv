import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface SkillsGenerationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (count: number) => Promise<void>;
}

export function SkillsGenerationDialog({
    open,
    onOpenChange,
    onGenerate,
}: SkillsGenerationDialogProps) {
    const [count, setCount] = useState(6);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await onGenerate(count);
            onOpenChange(false);
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Skills</DialogTitle>
                    <DialogDescription>
                        Analyze your experience and suggest relevant skills.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="count">Number of Skills</Label>
                            <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                        <Slider
                            id="count"
                            min={3}
                            max={15}
                            step={1}
                            value={[count]}
                            onValueChange={(vals) => setCount(vals[0])}
                            className="py-4"
                        />
                        <p className="text-xs text-muted-foreground">
                            We'll analyze your resume content to find the most relevant skills.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
