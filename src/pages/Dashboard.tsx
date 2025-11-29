import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumes, deleteResume, duplicateResume } from '@/lib/resume-storage';
import { getCoverLetters, deleteCoverLetter, duplicateCoverLetter, saveCoverLetter } from '@/lib/cover-letter-storage';
import { getUserResumesFromFirestore, deleteResumeFromFirestore, saveResumeToFirestore } from '@/lib/firestore-service';
import { getUserCoverLettersFromFirestore, deleteCoverLetterFromFirestore, saveCoverLetterToFirestore } from '@/lib/firestore-cover-letter-service';
import { incrementDownloadCount } from '@/lib/stats-service';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
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
import { PlusCircle, FileText, ArrowUpDown, Mail, Loader2, CheckSquare, X, Trash2, MessageCircle } from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import { ResumeCard } from '@/components/ResumeCard';
import { CoverLetterCard } from '@/components/CoverLetterCard';
import { cn } from '@/lib/utils';
import { ResumeData } from '@/types/resume';
import { CoverLetterData } from '@/types/coverletter';
import { RenameResumeDialog } from '@/components/RenameResumeDialog';
import { initialResumeStyle } from '@/data/initialData';
import { resumeTemplates } from '@/lib/resume-templates';
import { coverLetterTemplates } from '@/lib/coverletter-templates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { Checkbox } from '@/components/ui/checkbox';
import { CoverLetterTemplateSelectionDialog } from '@/components/CoverLetterTemplateSelectionDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      console.log('No user found in Dashboard, redirecting to login');
      navigate('/login'); // Optional: Redirect if not logged in
    } else {
      console.log('User found in Dashboard:', user.email, user.displayName);
    }
  }, [user, loading, navigate]);

  const [projects, setProjects] = useState<(ResumeData | CoverLetterData)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; type: 'resume' | 'cover-letter' } | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showCoverLetterTemplateSelection, setShowCoverLetterTemplateSelection] = useState(false);

  const [renamingResume, setRenamingResume] = useState<ResumeData | null>(null);
  const [renamingCoverLetter, setRenamingCoverLetter] = useState<CoverLetterData | null>(null); // We might need a separate dialog or reuse
  const [downloadingResume, setDownloadingResume] = useState<{ resume: ResumeData; format: 'pdf' | 'png' | 'jpeg' | 'html' } | null>(null);
  const [downloadingCoverLetter, setDownloadingCoverLetter] = useState<{ coverLetter: CoverLetterData; format: 'pdf' | 'png' | 'jpeg' | 'html' } | null>(null);

  const downloadRef = useRef<HTMLDivElement>(null);
  const coverLetterDownloadRef = useRef<HTMLDivElement>(null);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const refreshProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    console.log('🔍 Fetching projects for user:', user.uid, user.email);
    try {
      // Fetch Resumes (Firestore + LocalStorage fallback handled in service/storage if needed, but here we mix)
      // For now, let's stick to the existing pattern: Firestore for resumes if logged in
      const fetchedResumes = await getUserResumesFromFirestore(user.uid);
      console.log('📄 Fetched resumes:', fetchedResumes.length, fetchedResumes);

      // Fetch Cover Letters from Firestore
      const fetchedCoverLetters = await getUserCoverLettersFromFirestore(user.uid);
      console.log('✉️ Fetched cover letters:', fetchedCoverLetters.length, fetchedCoverLetters);

      const allProjects = [...fetchedResumes, ...fetchedCoverLetters];
      console.log('📦 Total projects:', allProjects.length);

      if (sortOrder === 'newest') {
        allProjects.sort((a, b) => b.lastModified - a.lastModified);
      } else {
        allProjects.sort((a, b) => a.lastModified - b.lastModified);
      }
      setProjects(allProjects);
      setSelectedProjects([]); // Clear selection on refresh
    } catch (error) {
      console.error("❌ Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProjects();
    }
  }, [user, sortOrder]);

  const handleDelete = async () => {
    if (projectToDelete && user) {
      if (projectToDelete.type === 'resume') {
        await deleteResumeFromFirestore(user.uid, projectToDelete.id);
      } else {
        await deleteCoverLetterFromFirestore(user.uid, projectToDelete.id);
      }
      refreshProjects();
      setProjectToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedProjects.length === 0) return;

    for (const id of selectedProjects) {
      const project = projects.find(p => p.id === id);
      if (project) {
        if ('recipient' in project) {
          await deleteCoverLetterFromFirestore(user.uid, id);
        } else {
          await deleteResumeFromFirestore(user.uid, id);
        }
      }
    }
    refreshProjects();
    setShowBulkDeleteConfirm(false);
    setSelectedProjects([]);
    setIsSelectionMode(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, id]);
    } else {
      setSelectedProjects(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleOpenProject = (path: string) => {
    navigate(path);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedProjects([]);
  };

  const handleDuplicate = async (id: string, type: 'resume' | 'cover-letter') => {
    if (!user) return;
    if (type === 'resume') {
      const resumeToDuplicate = projects.find(p => p.id === id && !('recipient' in p)) as ResumeData;
      if (resumeToDuplicate) {
        const newResume = {
          ...resumeToDuplicate,
          id: uuidv4(),
          title: `${resumeToDuplicate.title} (Copy)`,
          lastModified: Date.now(),
          userId: user.uid
        };
        await saveResumeToFirestore(user.uid, newResume);
      }
    } else {
      const coverLetterToDuplicate = projects.find(p => p.id === id && 'recipient' in p) as CoverLetterData;
      if (coverLetterToDuplicate) {
        const newCoverLetter = {
          ...coverLetterToDuplicate,
          id: uuidv4(),
          title: `${coverLetterToDuplicate.title} (Copy)`,
          lastModified: Date.now(),
          userId: user.uid
        };
        await saveCoverLetterToFirestore(user.uid, newCoverLetter);
      }
    }
    refreshProjects();
  };

  const handleRenameResume = async (resumeId: string, newTitle: string) => {
    if (!user) return;
    const resumeToUpdate = projects.find(r => r.id === resumeId && !('recipient' in r)) as ResumeData;
    if (resumeToUpdate) {
      const updatedResume = { ...resumeToUpdate, title: newTitle };
      await saveResumeToFirestore(user.uid, updatedResume);
      refreshProjects();
    }
  };

  // Reuse RenameResumeDialog for Cover Letter by adapting props or create a new one. 
  // For simplicity, let's assume we can reuse it or just use a prompt for now for cover letters if dialog is strictly typed to ResumeData.
  // Actually, RenameResumeDialog takes `resume` prop. Let's stick to Resumes for rename dialog for now, 
  // and maybe add a simple prompt for Cover Letter rename or update the dialog later.
  // Let's try to cast CoverLetter to ResumeData for the dialog if the fields match enough (id, title).
  // ResumeData has many fields. Better to just use prompt for Cover Letter for now.
  const handleRenameCoverLetter = (coverLetter: CoverLetterData) => {
    const newTitle = prompt("Enter new title:", coverLetter.title);
    if (newTitle) {
      saveCoverLetter({ ...coverLetter, title: newTitle });
      refreshProjects();
    }
  }

  // Resume Download Effect
  useEffect(() => {
    if (!downloadingResume || !downloadRef.current) return;

    const resumeElement = downloadRef.current;
    const { resume, format } = downloadingResume;

    const performDownload = async () => {
      const canvas = await html2canvas(resumeElement, { scale: 3, useCORS: true, logging: false });

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`${resume.personalInfo.name.replace(' ', '_')}_Resume.pdf`);
      } else if (format === 'png' || format === 'jpeg') {
        const imgData = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `${resume.personalInfo.name.replace(' ', '_')}_Resume.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await incrementDownloadCount();
      } else if (format === 'html') {
        const htmlContent = resumeElement.innerHTML;
        const fullHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>${resume.personalInfo.name}'s Resume</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div style="width: 210mm; min-height: 297mm;">${htmlContent}</div>
          </body>
          </html>
        `;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.personalInfo.name.replace(' ', '_')}_Resume.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await incrementDownloadCount();
        URL.revokeObjectURL(url);
      }

      setDownloadingResume(null);
    };

    const timer = setTimeout(performDownload, 100);
    return () => clearTimeout(timer);

  }, [downloadingResume]);

  // Cover Letter Download Effect
  useEffect(() => {
    if (!downloadingCoverLetter || !coverLetterDownloadRef.current) return;

    const element = coverLetterDownloadRef.current;
    const { coverLetter, format } = downloadingCoverLetter;

    const performDownload = async () => {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false });

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`${coverLetter.title || 'Cover_Letter'}.pdf`);
      } else if (format === 'png' || format === 'jpeg') {
        const imgData = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `${coverLetter.title || 'Cover_Letter'}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (format === 'html') {
        // HTML export logic for cover letter if needed
      }
      setDownloadingCoverLetter(null);
    }

    const timer = setTimeout(performDownload, 100);
    return () => clearTimeout(timer);
  }, [downloadingCoverLetter]);


  const handleDownloadResume = (resume: ResumeData, format: 'pdf' | 'png' | 'jpeg' | 'html') => {
    setDownloadingResume({ resume, format });
  };

  const handleDownloadCoverLetter = (coverLetter: CoverLetterData, format: 'pdf' | 'png' | 'jpeg' | 'html') => {
    setDownloadingCoverLetter({ coverLetter, format });
  }

  const ResumeTemplateComponent = downloadingResume ? resumeTemplates[downloadingResume.resume.templateId]?.component : null;
  const CoverLetterTemplateComponent = downloadingCoverLetter ? coverLetterTemplates[downloadingCoverLetter.coverLetter.templateId]?.component : null;

  const styleVariables = {
    '--font-family': initialResumeStyle.fontFamily,
    '--font-size-base': initialResumeStyle.fontSize,
    '--heading-font-size': initialResumeStyle.headingFontSize,
    '--accent-color': initialResumeStyle.accentColor,
    '--section-spacing': initialResumeStyle.sectionSpacing,
    '--page-margins': initialResumeStyle.pageMargins,
    '--primary-background-color': initialResumeStyle.primaryBackgroundColor,
    '--secondary-background-color': initialResumeStyle.secondaryBackgroundColor,
    '--primary-font-color': initialResumeStyle.primaryFontColor,
    '--secondary-font-color': initialResumeStyle.secondaryFontColor,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col h-screen relative">
      <header className="bg-transparent p-4 hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 flex-shrink-0 no-print h-auto sm:h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">My Projects</h1>
          {projects.length > 0 && (
            <span className="text-sm text-muted-foreground hidden md:inline">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {projects.length > 0 && (
            <Button
              variant={isSelectionMode ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleSelectionMode}
              className={cn("gap-2", isSelectionMode && "bg-muted")}
            >
              {isSelectionMode ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Manage
                </>
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                Newest First {sortOrder === 'newest' && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                Oldest First {sortOrder === 'oldest' && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowCoverLetterTemplateSelection(true)} variant="outline" className="shadow-sm">
            <Mail className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Cover Letter</span>
            <span className="sm:hidden">Cover Letter</span>
          </Button>
          <Button onClick={() => navigate('/interview-coach')} variant="outline" className="shadow-sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Interview Coach</span>
            <span className="sm:hidden">Interview</span>
          </Button>
          <Button onClick={() => handleOpenProject('/templates')} className="shadow-sm w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create New Resume</span>
            <span className="sm:hidden">New Resume</span>
          </Button>
          <UserNav />
        </div>
      </header >
      <main className="flex-grow p-4 md:p-8 overflow-y-auto bg-background">
        <div className={cn("bg-muted rounded-2xl p-4 md:p-8 border", projects.length === 0 && "h-full")}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : projects.length > 0 ? (
            <>
              {isSelectionMode && (
                <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProjects.length === projects.length && projects.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All
                    </label>
                  </div>
                  {selectedProjects.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteConfirm(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected ({selectedProjects.length})
                    </Button>
                  )}
                </div>
              )}
              <div
                className="grid gap-6 items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              >
                {projects.map((project) => {
                  if ('recipient' in project) {
                    return (
                      <CoverLetterCard
                        key={project.id}
                        coverLetter={project as CoverLetterData}
                        onDelete={(id) => setProjectToDelete({ id, type: 'cover-letter' })}
                        onRename={handleRenameCoverLetter}
                        onDuplicate={(id) => handleDuplicate(id, 'cover-letter')}
                        onDownload={handleDownloadCoverLetter}
                        isSelected={isSelectionMode ? selectedProjects.includes(project.id) : undefined}
                        onSelect={isSelectionMode ? (checked) => handleSelectProject(project.id, checked) : undefined}
                        onOpen={(cl) => handleOpenProject(`/cover-letter/${cl.templateId}/${cl.id}`)}
                      />
                    );
                  }
                  return (
                    <ResumeCard
                      key={project.id}
                      resume={project as ResumeData}
                      onDelete={(id) => setProjectToDelete({ id, type: 'resume' })}
                      onRename={setRenamingResume}
                      onDuplicate={(id) => handleDuplicate(id, 'resume')}
                      onDownload={handleDownloadResume}
                      isSelected={isSelectionMode ? selectedProjects.includes(project.id) : undefined}
                      onSelect={isSelectionMode ? (checked) => handleSelectProject(project.id, checked) : undefined}
                      onOpen={(r) => handleOpenProject(`/editor/${r.id}`)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="rounded-full bg-muted p-6 mb-6">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Start Your Journey</h2>
                  <p className="text-muted-foreground text-center max-w-md mb-8">
                    Create your first resume or cover letter to get started. Choose from our professionally designed templates.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleOpenProject('/templates')}
                      size="lg"
                      className="shadow-lg"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Resume
                    </Button>
                    <Button
                      onClick={() => setShowCoverLetterTemplateSelection(true)}
                      size="lg"
                      variant="outline"
                      className="shadow-sm"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Create Cover Letter
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <CoverLetterTemplateSelectionDialog
        open={showCoverLetterTemplateSelection}
        onOpenChange={setShowCoverLetterTemplateSelection}
      />
      <AlertDialog open={!!projectToDelete || showBulkDeleteConfirm} onOpenChange={(open) => {
        if (!open) {
          setProjectToDelete(null);
          setShowBulkDeleteConfirm(false);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {showBulkDeleteConfirm
                ? `This will permanently delete ${selectedProjects.length} selected items. This action cannot be undone.`
                : `This will permanently delete this ${projectToDelete?.type === 'resume' ? 'resume' : 'cover letter'}. This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={showBulkDeleteConfirm ? handleBulkDelete : handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <RenameResumeDialog
        isOpen={!!renamingResume}
        onClose={() => setRenamingResume(null)}
        resume={renamingResume}
        onRename={handleRenameResume}
      />

      {/* Hidden Render Areas for Downloads */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {downloadingResume && ResumeTemplateComponent && (
          <div ref={downloadRef} style={styleVariables}>
            <ResumeTemplateComponent resumeData={downloadingResume.resume} />
          </div>
        )}
        {downloadingCoverLetter && CoverLetterTemplateComponent && (
          <div ref={coverLetterDownloadRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white' }}>
            <CoverLetterTemplateComponent data={downloadingCoverLetter.coverLetter} />
          </div>
        )}
      </div>
    </div >
  );
};

export default Dashboard;