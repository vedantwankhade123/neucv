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
import { Briefcase } from 'lucide-react';

interface JobRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinue: (jobRole: string) => void;
}

export function JobRoleDialog({
    open,
    onOpenChange,
    onContinue,
}: JobRoleDialogProps) {
    const [jobRole, setJobRole] = useState('');

    const handleContinue = () => {
        if (jobRole.trim()) {
            onContinue(jobRole.trim());
            setJobRole('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        What role are you applying for?
                    </DialogTitle>
                    <DialogDescription>
                        Enter the job title or role you're creating this resume for. This helps us tailor the content and AI suggestions.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobRole">Job Title / Role</Label>
                        <Input
                            id="jobRole"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            placeholder="e.g. Senior Software Engineer, Product Manager, Marketing Director"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && jobRole.trim()) {
                                    handleContinue();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleContinue} disabled={!jobRole.trim()}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

