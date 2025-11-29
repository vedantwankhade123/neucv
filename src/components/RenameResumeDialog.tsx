import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeData } from '@/types/resume';

interface RenameResumeDialogProps {
  resume: ResumeData | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (resumeId: string, newTitle: string) => void;
}

export const RenameResumeDialog = ({ resume, isOpen, onClose, onRename }: RenameResumeDialogProps) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (resume) {
      setTitle(resume.title);
    }
  }, [resume]);

  const handleSave = () => {
    if (resume && title.trim()) {
      onRename(resume.id, title.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Resume</DialogTitle>
          <DialogDescription>
            Enter a new title for your resume.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resume-title" className="text-right">
              Title
            </Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};