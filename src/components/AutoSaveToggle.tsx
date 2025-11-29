import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { getAutoSaveSettings, updateResumeAutoSave } from '@/lib/settings';

export function AutoSaveToggle() {
    const [resumeAutoSave, setResumeAutoSave] = useState(true);

    useEffect(() => {
        const settings = getAutoSaveSettings();
        setResumeAutoSave(settings.resumeAutoSave);
    }, []);

    const handleResumeToggle = (checked: boolean) => {
        setResumeAutoSave(checked);
        updateResumeAutoSave(checked);
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

            <div className="px-4 py-2 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Disable auto-save if you prefer manual control with the "Save Draft" button. Your changes will still be preserved when you click save.
                </p>
            </div>
        </div>
    );
}
