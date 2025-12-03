import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeStyle } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, FileText, MessageCircle, Key, Share2, Heart, LayoutTemplate } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { resumeTemplates } from '@/lib/resume-templates';
import { cn } from '@/lib/utils';
import { previewDataMap } from '@/data/previewData';
import { UserNav } from '@/components/UserNav';
import { TemplatePreview } from '@/components/TemplatePreview';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const backgroundColors = [
  'bg-slate-50 dark:bg-slate-900/20',
  'bg-rose-50 dark:bg-rose-900/20',
  'bg-amber-50 dark:bg-amber-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
];

const Home = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [isJobRoleDialogOpen, setIsJobRoleDialogOpen] = useState(false);
  const [selectedTemplateForJobRole, setSelectedTemplateForJobRole] = useState<string | null>(null);
  const [selectedStylesForJobRole, setSelectedStylesForJobRole] = useState<ResumeStyle | undefined>(undefined);

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
      const { v4: uuidv4 } = await import('uuid');
      const { saveResumeToFirestore } = await import('@/lib/firestore-service');
      const { incrementResumeCount } = await import('@/lib/stats-service');
      const { initialResumeStyle } = await import('@/data/initialData');

      const newResumeId = uuidv4();
      const newResume = {
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
    }
  };

  const featuredTemplateIds: Array<keyof typeof resumeTemplates> = ['corporate', 'modern', 'designer'];
  const featuredTemplates = featuredTemplateIds
    .filter((id): id is keyof typeof resumeTemplates => {
      const hasTemplate = !!resumeTemplates[id];
      const hasPreviewData = !!previewDataMap[id];
      if (!hasTemplate || !hasPreviewData) {
        console.warn(`Template ${id} is missing template or preview data`);
      }
      return hasTemplate && hasPreviewData;
    })
    .map(id => [id, resumeTemplates[id]] as const);

  return (
    <div className="flex flex-col min-h-full bg-white overflow-hidden">
      <header className="bg-white border-b p-3 hidden md:block flex-shrink-0 no-print h-14">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <h1 className="text-lg font-bold tracking-tight">Welcome, {user?.displayName || 'User'}</h1>
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
      <main className="flex-grow p-3 md:p-6 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto">

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
              <p className="text-muted-foreground mt-1">Get started with common tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Create New Resume Card */}
            <div
              className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/templates')}
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:bg-primary/20" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Create Resume</h3>
                  <p className="text-sm text-muted-foreground mt-1">Build a professional resume from scratch</p>
                </div>
              </div>
            </div>

            {/* Interview Coach Card */}
            <div
              className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/dashboard/interview')}
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all duration-300 group-hover:bg-purple-500/20" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Interview Coach</h3>
                  <p className="text-sm text-muted-foreground mt-1">Practice with our AI interviewer</p>
                </div>
              </div>
            </div>

            {/* Browse Templates Card */}
            <div
              className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/templates')}
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all duration-300 group-hover:bg-blue-500/20" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <LayoutTemplate className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Browse Templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">Explore professional designs</p>
                </div>
              </div>
            </div>

            {/* Add API Key Card */}
            <div
              className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition-all duration-300 group-hover:bg-amber-500/20" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                  <Key className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">API Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">Manage your Gemini API key</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          {/* Resume Templates Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Resume Templates</h2>
                <p className="text-muted-foreground mt-1">Professional designs for every career path</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/templates')}>
                View All Resumes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {featuredTemplates.slice(0, 3).map(([id, template], index) => {
                const previewData = previewDataMap[id];
                if (!previewData) {
                  return null;
                }

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
                          <Eye className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold mt-4 text-lg text-foreground/90 group-hover:text-primary transition-colors">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">Resume</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <TemplatePreviewModal
        isOpen={!!previewingTemplateId}
        onClose={() => setPreviewingTemplateId(null)}
        templateId={previewingTemplateId}
        onSelectTemplate={handleSelectTemplate}
      />
    </div >
  );
};

export default Home;