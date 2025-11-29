import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeStyle } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, FileText, MessageCircle } from 'lucide-react';
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
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-grow p-3 md:p-6 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto">

        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Create New Resume Card */}
            <div
              className="border-2 border-dashed rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-4 aspect-[3/2]"
              onClick={() => navigate('/templates')}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">Create Resume</h3>
                <p className="text-sm text-muted-foreground">Build a professional resume</p>
              </div>
            </div>

            {/* Interview Coach Card */}
            <div
              className="border-2 border-dashed rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-4 aspect-[3/2]"
              onClick={() => navigate('/dashboard/interview')}
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">Interview Coach</h3>
                <p className="text-sm text-muted-foreground">Practice with AI interviewer</p>
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
                          <Eye className="h-8 w-8 text-white" />
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
    </div>
  );
};

export default Home;