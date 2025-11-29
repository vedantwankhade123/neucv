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
import { Loader2, Sparkles } from 'lucide-react';

interface ExperienceGenerationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (data: ExperienceGenerationData) => Promise<void>;
    initialRole?: string;
    initialCompany?: string;
}

export interface ExperienceGenerationData {
    role: string;
    company: string;
    keywords: string;
}

export function ExperienceGenerationDialog({
    open,
    onOpenChange,
    onGenerate,
    initialRole = '',
    initialCompany = ''
}: ExperienceGenerationDialogProps) {
    const [role, setRole] = useState(initialRole);
    const [company, setCompany] = useState(initialCompany);
    const [keywords, setKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Update state when initial props change or dialog opens
    useEffect(() => {
        if (open) {
            setRole(initialRole);
            setCompany(initialCompany);
            setKeywords('');
        }
    }, [open, initialRole, initialCompany]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await onGenerate({
                role,
                company,
                keywords
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
                    <DialogTitle>Generate Experience Description</DialogTitle>
                    <DialogDescription>
                        Provide some details to generate professional bullet points for this role.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role / Job Title</Label>
                        <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Product Manager"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Tech Corp"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="keywords">Key Responsibilities / Keywords</Label>
                        <Textarea
                            id="keywords"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g. Roadmap planning, stakeholder management, agile methodology, launched mobile app..."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !role}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Points
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
