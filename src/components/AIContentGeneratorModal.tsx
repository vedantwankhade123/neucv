import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateCoverLetterBody } from '@/lib/gemini';
import { deductCredit, getUserProfile } from '@/lib/user-service';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AIContentGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (content: string) => void;
}

export function AIContentGeneratorModal({ isOpen, onClose, onGenerate }: AIContentGeneratorModalProps) {
    const [jobDescription, setJobDescription] = useState('');
    const [experience, setExperience] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!user) return;
        setIsGenerating(true);
        try {
            const profile = await getUserProfile(user);
            if (profile.credits <= 0) {
                toast({ title: "Insufficient Credits", description: "Please upgrade to generate more content.", variant: "destructive" });
                return;
            }

            const content = await generateCoverLetterBody(jobDescription, { summary: experience, experience: [] }); // minimal resume data
            onGenerate(content);
            await deductCredit(user.uid);
            toast({ title: "Generated!", description: "1 credit deducted." });
            onClose();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to generate content. Please check your API key.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Generate Cover Letter Body</DialogTitle>
                    <DialogDescription>
                        Paste the job description and your experience summary to let AI write for you. (Cost: 1 Credit)
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Job Description</Label>
                        <Textarea
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Your Experience / Resume Summary</Label>
                        <Textarea
                            placeholder="Paste your professional summary or key highlights from your resume..."
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !jobDescription || !experience} className="gap-2">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
