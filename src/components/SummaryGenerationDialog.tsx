import React, { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from 'lucide-react';

interface SummaryGenerationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (data: SummaryGenerationData) => Promise<void>;
    initialJobTitle?: string;
    initialExperience?: string;
}

export interface SummaryGenerationData {
    jobTitle: string;
    experience: string;
    achievements: string;
    tone: string;
}

export function SummaryGenerationDialog({
    open,
    onOpenChange,
    onGenerate,
    initialJobTitle = '',
    initialExperience = ''
}: SummaryGenerationDialogProps) {
    const [jobTitle, setJobTitle] = useState(initialJobTitle);
    const [experience, setExperience] = useState(initialExperience);
    const [achievements, setAchievements] = useState('');
    const [tone, setTone] = useState('professional');
    const [isGenerating, setIsGenerating] = useState(false);

    // Update jobTitle when initialJobTitle changes
    useEffect(() => {
        if (initialJobTitle) {
            setJobTitle(initialJobTitle);
        }
    }, [initialJobTitle]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Use jobTitle from input, or fall back to initialJobTitle if input is empty
            await onGenerate({
                jobTitle: jobTitle || initialJobTitle,
                experience,
                achievements,
                tone
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Generate Professional Summary</DialogTitle>
                    <DialogDescription>
                        Answer a few questions to help the AI create a tailored summary for you.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobTitle">Target Job Title</Label>
                        <Input
                            id="jobTitle"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                            id="experience"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="e.g. 5+ years"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="achievements">Key Achievements / Highlights</Label>
                        <Textarea
                            id="achievements"
                            value={achievements}
                            onChange={(e) => setAchievements(e.target.value)}
                            placeholder="e.g. Led a team of 5, increased sales by 20%, launched 3 major products..."
                            rows={3}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tone">Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional (Standard)</SelectItem>
                                <SelectItem value="executive">Executive (Strategic & Leadership focused)</SelectItem>
                                <SelectItem value="creative">Creative (Unique & Engaging)</SelectItem>
                                <SelectItem value="technical">Technical (Skill-focused)</SelectItem>
                                <SelectItem value="entry-level">Entry Level (Eager & Learner)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || (!jobTitle && !initialJobTitle)}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Summary
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
