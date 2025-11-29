import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Mail } from 'lucide-react';
import { getAutoSaveSettings, updateResumeAutoSave, updateCoverLetterAutoSave } from '@/lib/settings';

export function AutoSaveToggle() {
    const [resumeAutoSave, setResumeAutoSave] = useState(true);
    const [coverLetterAutoSave, setCoverLetterAutoSave] = useState(true);

    useEffect(() => {
        const settings = getAutoSaveSettings();
        setResumeAutoSave(settings.resumeAutoSave);
        setCoverLetterAutoSave(settings.coverLetterAutoSave);
    }, []);

    const handleResumeToggle = (checked: boolean) => {
        setResumeAutoSave(checked);
        updateResumeAutoSave(checked);
    };

    const handleCoverLetterToggle = (checked: boolean) => {
        setCoverLetterAutoSave(checked);
        updateCoverLetterAutoSave(checked);
    };

    return (
        <div className="space-y-4">
            {/* Resume Auto-Save */}
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                        <Label htmlFor="resume-auto-save" className="text-base font-medium cursor-pointer">
                            Resume Auto-Save
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Automatically save resume changes every second
                        </p>
                    </div>
                </div>
                <Switch
                    id="resume-auto-save"
                    checked={resumeAutoSave}
                    onCheckedChange={handleResumeToggle}
                />
            </div>

            {/* Cover Letter Auto-Save */}
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                        <Label htmlFor="cover-letter-auto-save" className="text-base font-medium cursor-pointer">
                            Cover Letter Auto-Save
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Automatically save cover letter changes every second
                        </p>
                    </div>
                </div>
                <Switch
                    id="cover-letter-auto-save"
                    checked={coverLetterAutoSave}
                    onCheckedChange={handleCoverLetterToggle}
                />
            </div>

            <div className="px-4 py-2 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Disable auto-save if you prefer manual control with the "Save Draft" button. Your changes will still be preserved when you click save.
                </p>
            </div>
        </div>
    );
}
