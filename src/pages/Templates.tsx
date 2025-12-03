import { useNavigate } from 'react-router-dom';
import { ResumeStyle } from '@/types/resume';
import { resumeTemplates } from '@/lib/resume-templates';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Loader2, FileText, Share2, Heart } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { JobRoleDialog } from '@/components/JobRoleDialog';
import { cn } from '@/lib/utils';
import { createResume } from '@/lib/resume-storage';
import { previewDataMap } from '@/data/previewData';
import { UserNav } from '@/components/UserNav';
import { TemplatePreview } from '@/components/TemplatePreview';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveResumeToFirestore } from '@/lib/firestore-service';
import { incrementResumeCount } from '@/lib/stats-service';
import { v4 as uuidv4 } from 'uuid';
import { ResumeData } from '@/types/resume';
import { initialResumeStyle } from '@/data/initialData';

const backgroundColors = [
  'bg-slate-50 dark:bg-slate-900/20',
  'bg-rose-50 dark:bg-rose-900/20',
  'bg-amber-50 dark:bg-amber-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
  'bg-sky-50 dark:bg-sky-900/20',
  'bg-violet-50 dark:bg-violet-900/20'
];

const Templates = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [isJobRoleDialogOpen, setIsJobRoleDialogOpen] = useState(false);
  const [selectedTemplateForJobRole, setSelectedTemplateForJobRole] = useState<string | null>(null);
  const [selectedStylesForJobRole, setSelectedStylesForJobRole] = useState<ResumeStyle | undefined>(undefined);



  const [user] = useAuthState(auth);

  const handleSelectTemplate = async (templateId: string, styles?: ResumeStyle) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Store template and styles, then open job role dialog
    setSelectedTemplateForJobRole(templateId);
    setSelectedStylesForJobRole(styles);
    setIsJobRoleDialogOpen(true);
  };

  const handleJobRoleContinue = async (jobRole: string) => {
    if (!user || !selectedTemplateForJobRole) return;

    setIsCreatingResume(true);

    try {
      // Create new resume data object
      const newResumeId = uuidv4();
      const newResume: ResumeData = {
        id: newResumeId,
        userId: user.uid,
        title: jobRole || 'Untitled Resume',
        templateId: selectedTemplateForJobRole,
        lastModified: Date.now(),
        personalInfo: {
          name: user.displayName || '',
          email: user.email || '',
          phone: '',
          address: '',
          linkedin: '',
          github: '',
          photoUrl: user.photoURL || '/placeholder.svg'
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        customSections: [],
        layout: [
          { id: 'summary', name: 'Professional Summary', enabled: true },
          { id: 'experience', name: 'Experience', enabled: true },
          { id: 'education', name: 'Education', enabled: true },
          { id: 'skills', name: 'Skills', enabled: true },
          { id: 'customSections', name: 'Custom Sections', enabled: true },
        ],
        styles: selectedStylesForJobRole || initialResumeStyle
      };

      await saveResumeToFirestore(user.uid, newResume);
      await incrementResumeCount();
      navigate(`/editor/${newResume.id}`);
    } catch (error) {
      console.error("Error creating resume:", error);
      setIsCreatingResume(false);
      // Handle error (maybe show toast)
    }
  };

  const filteredTemplates = Object.entries(resumeTemplates).filter(([, template]) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <header className="bg-transparent p-4 hidden md:block flex-shrink-0 no-print h-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <div className="flex items-center gap-2">
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
                    <p className="text-xs text-muted-foreground">Your contributions help keep this project free!</p>
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
      </header>
      <main className="flex-grow p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose a Template to Get Started</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Select a design you like. You can always change styles and colors later in the editor.</p>
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-full rounded-full h-12 text-base shadow-md focus:shadow-inner transition-shadow duration-200"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(([id, template], index) => {
              const TemplateComponent = template.component;
              const previewData = previewDataMap[id];
              if (!previewData) return null;
              return (
                <div key={id} className="flex flex-col items-center group cursor-pointer" onClick={() => setPreviewingTemplateId(id)}>
                  <div className={cn(
                    "relative w-full aspect-[210/297] rounded-xl transition-all duration-300 group-hover:ring-2 group-hover:ring-primary ring-offset-4 shadow-sm group-hover:shadow-xl",
                    backgroundColors[index % backgroundColors.length]
                  )}>
                    <div className="absolute inset-4 flex items-center justify-center">
                      <TemplatePreview
                        resume={previewData}
                        className="h-full shadow-lg"
                        showHoverEffect={false}
                      />
                    </div>

                    {template.isPremium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                        Premium
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] rounded-xl">
                      <div className="bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold mt-4 text-lg text-foreground/90 group-hover:text-primary transition-colors">{template.name}</h3>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              <p className="text-lg">No templates found for "{searchQuery}".</p>
              <p className="text-sm">Try searching for something else.</p>
            </div>
          )}
        </div>
      </main>

      {/* Loading Overlay */}
      {isCreatingResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative rounded-full bg-primary/10 p-4">
                <FileText className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-foreground">Creating Your Resume</p>
              <p className="text-sm text-muted-foreground">Setting up your workspace...</p>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <TemplatePreviewModal
        isOpen={!!previewingTemplateId}
        onClose={() => setPreviewingTemplateId(null)}
        templateId={previewingTemplateId}
        onSelectTemplate={handleSelectTemplate}
      />

      <JobRoleDialog
        open={isJobRoleDialogOpen}
        onOpenChange={setIsJobRoleDialogOpen}
        onContinue={handleJobRoleContinue}
      />
    </div>
  );
};

export default Templates;