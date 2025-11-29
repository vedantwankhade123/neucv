import { useState } from 'react';
import { Download, CheckCircle, Eraser, RotateCcw, ArrowLeft, MoreVertical, Save, Bot, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { UserNav } from './UserNav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResumeData } from '@/types/resume';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onPreviewClick: () => void;
  onClear: () => void;
  onResetStyles: () => void;
  resumeData: ResumeData;
  mobileView?: 'form' | 'preview';
  onDownloadPdf: () => void;
  onDownloadPng: () => void;
  onDownloadJpeg: () => void;
  onDownloadHtml: () => void;
  onSave?: () => void;
  autoSaveEnabled?: boolean;
}

const Header = ({ onPreviewClick, onClear, onResetStyles, mobileView, onDownloadPdf, onDownloadPng, onDownloadJpeg, onDownloadHtml, onSave, autoSaveEnabled = true }: HeaderProps) => {
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleClear = () => {
    onClear();
    setIsClearAlertOpen(false);
  };

  const MobileHeader = () => (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        {mobileView === 'preview' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="icon" className="rounded-full">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDownloadPdf}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadPng}>PNG</DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadJpeg}>JPG</DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadHtml}>HTML</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">

            <DropdownMenuItem onClick={() => setIsClearAlertOpen(true)}>
              <Eraser className="mr-2 h-4 w-4" />
              <span>Clear Content</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onResetStyles}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Reset Styles</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserNav />
      </div>
    </div>
  );

  const DesktopHeader = () => (
    <>
      <div className="flex items-center gap-4">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="rounded-full text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {autoSaveEnabled ? (
          <Button variant="ghost" disabled className="text-muted-foreground">
            <CheckCircle className="mr-2 h-4 w-4" />
            Auto-Saved
          </Button>
        ) : (
          <Button variant="default" onClick={onSave} className="rounded-full shadow-md hover:shadow-lg transition-shadow">
            <CheckCircle className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setIsClearAlertOpen(true)}>
              <Eraser className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear Content</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onResetStyles}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Styles</p>
          </TooltipContent>
        </Tooltip>

        <Button onClick={onPreviewClick} className="rounded-full shadow-md hover:shadow-lg transition-shadow">
          <Download className="mr-2 h-4 w-4" />
          Preview & Download
        </Button>
        <UserNav />
      </div>
    </>
  );

  return (
    <>
      <header className="bg-transparent p-4 flex items-center justify-between flex-shrink-0 no-print h-16">
        {isMobile ? <MobileHeader /> : <DesktopHeader />}
      </header>
      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all content from this resume. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;