import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserResumesFromFirestore, deleteResumeFromFirestore, saveResumeToFirestore } from '@/lib/firestore-service';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, FileText, ArrowUpDown, CheckSquare, X, Trash2, MessageCircle, Share2, Heart } from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import { ResumeCard } from '@/components/ResumeCard';
import { cn } from '@/lib/utils';
import { ResumeData } from '@/types/resume';
import { RenameResumeDialog } from '@/components/RenameResumeDialog';
import { initialResumeStyle } from '@/data/initialData';
import { resumeTemplates } from '@/lib/resume-templates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { Checkbox } from '@/components/ui/checkbox';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      console.log('No user found in Dashboard, redirecting to login');
      navigate('/login');
    } else {
      console.log('User found in Dashboard:', user.email, user.displayName);
    }
  }, [user, loading, navigate]);

  const [projects, setProjects] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string } | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [renamingResume, setRenamingResume] = useState<ResumeData | null>(null);
  const [downloadingResume, setDownloadingResume] = useState<{ resume: ResumeData; format: 'pdf' | 'png' | 'jpeg' | 'html' } | null>(null);

  const downloadRef = useRef<HTMLDivElement>(null);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const refreshProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    console.log('🔍 Fetching projects for user:', user.uid, user.email);
    try {
      const fetchedResumes = await getUserResumesFromFirestore(user.uid);
      console.log('📄 Fetched resumes:', fetchedResumes.length, fetchedResumes);

      const allProjects = [...fetchedResumes];
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
      await deleteResumeFromFirestore(user.uid, projectToDelete.id);
      refreshProjects();
      setProjectToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedProjects.length === 0) return;

    for (const id of selectedProjects) {
      await deleteResumeFromFirestore(user.uid, id);
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

  const handleDuplicate = async (id: string) => {
    if (!user) return;
    const resumeToDuplicate = projects.find(p => p.id === id);
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
    refreshProjects();
  };

  const handleRenameResume = async (resumeId: string, newTitle: string) => {
    if (!user) return;
    const resumeToUpdate = projects.find(r => r.id === resumeId);
    if (resumeToUpdate) {
      const updatedResume = { ...resumeToUpdate, title: newTitle };
      await saveResumeToFirestore(user.uid, updatedResume);
      refreshProjects();
    }
  };

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


  const handleDownloadResume = (resume: ResumeData, format: 'pdf' | 'png' | 'jpeg' | 'html') => {
    setDownloadingResume({ resume, format });
  };

  const ResumeTemplateComponent = downloadingResume ? resumeTemplates[downloadingResume.resume.templateId]?.component : null;

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
    <div className="flex flex-col relative bg-white h-full overflow-hidden">
      <header className="bg-white border-b p-3 hidden md:block flex-shrink-0 no-print h-14">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 h-full">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">My Resumes</h1>
            {projects.length > 0 && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                {projects.length} {projects.length === 1 ? 'resume' : 'resumes'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {projects.length > 0 && (
              <Button
                variant={isSelectionMode ? "secondary" : "ghost"}
                size="sm"
                onClick={toggleSelectionMode}
                className={cn("gap-2 text-xs h-8", isSelectionMode && "bg-muted")}
              >
                {isSelectionMode ? (
                  <>
                    <X className="h-3 w-3" />
                    Cancel
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3" />
                    Manage
                  </>
                )}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ArrowUpDown className="h-3 w-3" />
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
            <Button onClick={() => navigate('/dashboard/interview')} variant="outline" className="shadow-sm h-8 text-xs">
              <MessageCircle className="mr-2 h-3 w-3" />
              <span className="hidden sm:inline">Interview Coach</span>
              <span className="sm:hidden">Interview</span>
            </Button>
            <Button onClick={() => handleOpenProject('/templates')} className="shadow-sm w-full sm:w-auto h-8 text-xs">
              <PlusCircle className="mr-2 h-3 w-3" />
              <span className="hidden sm:inline">Create New Resume</span>
              <span className="sm:hidden">New Resume</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'NeuCV - AI Resume Builder',
                    text: 'Check out this amazing free AI Resume Builder!',
                    url: window.location.origin
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Heart className="h-4 w-4 text-red-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Support the Project</h4>
                    <p className="text-xs text-muted-foreground">Your contributions help keep this project free and alive!</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <img src="/QR CODE.jpg" alt="UPI QR Code" className="w-32 h-32 object-contain" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-sm">Vedant Wankhade</p>
                      <p className="text-xs text-muted-foreground">UPI: 9175988560@kotak811</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <UserNav />
          </div>
        </div>
      </header >
      <main className="flex-grow p-3 md:p-6 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto bg-white">
        <div className={cn("bg-white rounded-xl p-3 md:p-6 border border-slate-200", projects.length === 0 && "h-full flex items-center justify-center min-h-[calc(100vh-8rem)]")}>
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
                className="grid gap-4 items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              >
                {projects.map((project) => (
                  <ResumeCard
                    key={project.id}
                    resume={project}
                    onDelete={(id) => setProjectToDelete({ id })}
                    onRename={setRenamingResume}
                    onDuplicate={handleDuplicate}
                    onDownload={handleDownloadResume}
                    isSelected={isSelectionMode ? selectedProjects.includes(project.id) : undefined}
                    onSelect={isSelectionMode ? (checked) => handleSelectProject(project.id, checked) : undefined}
                    onOpen={(r) => handleOpenProject(`/editor/${r.id}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center">
                  <div className="rounded-full bg-slate-100 p-4 mb-4 border border-slate-200">
                    <FileText className="h-12 w-12 text-slate-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">Start Your Journey</h2>
                  <p className="text-slate-600 text-center max-w-md mb-6 text-sm">
                    Create your first resume to get started. Choose from our professionally designed templates.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleOpenProject('/templates')}
                      size="default"
                      className="shadow-lg bg-black hover:bg-slate-800 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Resume
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
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
                : `This will permanently delete this resume. This action cannot be undone.`
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
      </div>
    </div >
  );
};

export default Dashboard;