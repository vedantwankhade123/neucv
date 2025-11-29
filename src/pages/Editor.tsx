import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ResumeForm from '@/components/ResumeForm';
import { ResumeData, ResumeStyle } from '@/types/resume';
import ResumePreviewContainer from '@/components/ResumePreviewContainer';
import PreviewModal from '@/components/PreviewModal';
import { initialResumeStyle } from '@/data/initialData';
import { v4 as uuidv4 } from 'uuid';
import { getResume } from '@/lib/resume-storage'; // Keep for migration
import { getResumeFromFirestore, saveResumeToFirestore } from '@/lib/firestore-service';
import { getAutoSaveSettings } from '@/lib/settings';
import { incrementDownloadCount } from '@/lib/stats-service';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { resumeTemplates } from '@/lib/resume-templates';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileViewToggle } from '@/components/MobileViewToggle';
import ZoomControls from '@/components/ZoomControls';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EditorLoading } from '@/components/EditorLoading';

const Editor = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Resume style is now part of resumeData, so we don't need a separate state for it
  // We'll create a derived state or just use resumeData.styles directly
  const resumeStyle = resumeData?.styles || initialResumeStyle;

  const setResumeStyle = (newStyles: ResumeStyle) => {
    setResumeData(prev => prev ? ({ ...prev, styles: newStyles }) : null);
  };

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const downloadResumeRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.84);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const fitToScreen = useCallback(() => {
    if (previewContainerRef.current) {
      const containerStyle = window.getComputedStyle(previewContainerRef.current);
      const paddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
      const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);
      const availableWidth = previewContainerRef.current.clientWidth - paddingX;
      const availableHeight = previewContainerRef.current.clientHeight - paddingY;
      const contentWidth = 794;
      const contentHeight = 1123;
      if (contentWidth <= 0 || contentHeight <= 0) return;
      const scaleX = availableWidth / contentWidth;
      const scaleY = availableHeight / contentHeight;

      // Use a slightly more generous margin on mobile to ensure it fits comfortably
      const margin = isMobile ? 0.92 : 0.95;
      const newScale = Math.min(scaleX, scaleY, 1) * margin;

      setZoom(newScale > 0 ? newScale : 1);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => setTimeout(fitToScreen, 50);
    if (isMobile) {
      handleResize();
    } else {
      setZoom(0.84);
    }
    const resizeObserver = new ResizeObserver(handleResize);
    const currentContainer = previewContainerRef.current;
    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, fitToScreen, mobileView]);

  useEffect(() => {
    if (!resumeId || !user) {
      // Wait for auth to be ready
      if (!loading && !user) navigate('/login');
      return;
    }

    const loadResume = async () => {
      try {
        const data = await getResumeFromFirestore(user.uid, resumeId);
        if (data) {
          // Ensure styles exist on loaded data
          if (!data.styles) {
            data.styles = initialResumeStyle;
          }
          // Ensure customSections is initialized
          if (!data.customSections) {
            data.customSections = [];
          }
          // Ensure layout includes customSections
          if (!data.layout.find(item => item.id === 'customSections')) {
            data.layout.push({ id: 'customSections', name: 'Custom Sections', enabled: true });
          }
          setResumeData(data);
        } else {
          // If not found in Firestore, check local storage (migration path)
          const localData = getResume(resumeId);
          if (localData) {
            // Migrate to Firestore immediately
            const migratedData = {
              ...localData,
              userId: user.uid,
              customSections: localData.customSections || [],
            };
            // Ensure layout includes customSections
            if (!migratedData.layout.find(item => item.id === 'customSections')) {
              migratedData.layout.push({ id: 'customSections', name: 'Custom Sections', enabled: true });
            }
            await saveResumeToFirestore(user.uid, migratedData);
            setResumeData(migratedData);
          } else {
            console.error("Resume not found in Firestore or LocalStorage");
            // Optional: Show a toast or error message before redirecting
            // toast({ title: "Error", description: "Resume not found", variant: "destructive" });
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error("Error loading resume", error);
        navigate('/dashboard');
      }
    };

    // Small delay to ensure Firestore write has propagated if coming from creation
    const timer = setTimeout(loadResume, 500);
    return () => clearTimeout(timer);
  }, [resumeId, navigate, user, loading]);


  // Auto-save effect
  useEffect(() => {
    if (resumeData && user) {
      // Re-check auto-save setting on every render to catch changes
      const settings = getAutoSaveSettings();

      if (settings.resumeAutoSave) {
        const saveTimer = setTimeout(() => {
          console.log('💾 Auto-saving resume...');
          saveResumeToFirestore(user.uid, resumeData);
        }, 1000); // Debounce save
        return () => clearTimeout(saveTimer);
      } else {
        console.log('⏸️ Auto-save is disabled');
      }
    }
  }, [resumeData, user]);


  // Removed localStorage effect for styles as they are now saved with resumeData

  const handleClearAll = () => {
    if (!resumeData) return;
    setResumeData(prev => prev ? ({
      ...prev,
      personalInfo: { name: '', email: '', phone: '', address: '', linkedin: '', github: '', photoUrl: '/placeholder.svg' },
      summary: '',
      experience: [{ id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' }],
      education: [{ id: uuidv4(), institution: '', degree: '', startDate: '', endDate: '' }],
      skills: [],
      customSections: [],
    }) : null);
  };

  const handleResetStyles = () => {
    setResumeStyle(initialResumeStyle);
  };

  const handleTemplateChange = (newTemplateId: string) => {
    setResumeData(prev => prev ? ({ ...prev, templateId: newTemplateId }) : null);
  };

  const handleDownloadPdf = async () => {
    if (!resumeData) return;
    const resumeElement = downloadResumeRef.current;
    if (!resumeElement) return;

    try {
      const canvas = await html2canvas(resumeElement, { scale: 3, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${resumeData.personalInfo.name.replace(' ', '_')}_Resume.pdf`);
      await incrementDownloadCount();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    if (!resumeData) return;
    const resumeElement = downloadResumeRef.current;
    if (!resumeElement) return;

    const canvas = await html2canvas(resumeElement, { scale: 3, useCORS: true, logging: false });
    const imgData = canvas.toDataURL(`image/${format}`);
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.${format === 'jpeg' ? 'jpg' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    await incrementDownloadCount();
  };

  const handleDownloadHtml = async () => {
    if (!resumeData) return;
    const resumeElement = downloadResumeRef.current;
    if (!resumeElement) return;

    const htmlContent = resumeElement.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${resumeData.personalInfo.name}'s Resume</title>
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
    a.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    await incrementDownloadCount();
  };

  if (!resumeData) {
    return <EditorLoading message="Loading..." />;
  }

  const TemplateComponent = resumeTemplates[resumeData.templateId]?.component;
  const photoRequired = !!resumeTemplates[resumeData.templateId]?.photoRequired;

  if (!TemplateComponent) {
    return <EditorLoading message="Loading template..." />;
  }

  const styleVariables = {
    '--font-family': resumeStyle.fontFamily,
    '--font-size-base': resumeStyle.fontSize,
    '--heading-font-size': resumeStyle.headingFontSize,
    '--accent-color': resumeStyle.accentColor,
    '--section-spacing': resumeStyle.sectionSpacing,
    '--page-margins': resumeStyle.pageMargins,
    '--primary-background-color': resumeStyle.primaryBackgroundColor,
    '--secondary-background-color': resumeStyle.secondaryBackgroundColor,
    '--primary-font-color': resumeStyle.primaryFontColor,
    '--secondary-font-color': resumeStyle.secondaryFontColor,
  } as React.CSSProperties;

  const handleManualSave = async () => {
    if (resumeData && user) {
      console.log('💾 Manually saving resume...');
      await saveResumeToFirestore(user.uid, resumeData);
      toast({
        title: 'Resume saved!',
        description: 'Your resume has been saved successfully.',
      });
    }
  };

  const autoSaveSettings = getAutoSaveSettings();

  return (
    <div className="flex flex-col h-screen bg-muted">
      <Header
        onPreviewClick={() => setIsPreviewModalOpen(true)}
        onClear={handleClearAll}
        onResetStyles={handleResetStyles}
        resumeData={resumeData}
        mobileView={isMobile ? mobileView : undefined}
        onDownloadPdf={handleDownloadPdf}
        onDownloadPng={() => handleDownloadImage('png')}
        onDownloadJpeg={() => handleDownloadImage('jpeg')}
        onDownloadHtml={handleDownloadHtml}
        onSave={handleManualSave}
        autoSaveEnabled={autoSaveSettings.resumeAutoSave}
      />
      <main className="flex-grow min-h-0">
        {isMobile ? (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto hide-scrollbar pb-32">
              {mobileView === 'form' ? (
                <div className="bg-background h-full">
                  <ResumeForm
                    resumeData={resumeData}
                    setResumeData={setResumeData}
                    resumeStyle={resumeStyle}
                    setResumeStyle={setResumeStyle}
                    templateId={resumeData.templateId}
                    photoRequired={photoRequired}
                    onTemplateChange={handleTemplateChange}
                  />
                </div>
              ) : (
                <div className="bg-secondary h-full">
                  <ResumePreviewContainer
                    resumeData={resumeData}
                    templateId={resumeData.templateId}
                    resumeStyle={resumeStyle}
                    zoom={zoom}
                    containerRef={previewContainerRef}
                  />
                </div>
              )}
            </div>
            <div className="fixed bottom-4 left-4 right-4 z-50 no-print">
              <MobileViewToggle view={mobileView} setView={setMobileView} />
            </div>
            {mobileView === 'preview' && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 no-print">
                <ZoomControls zoom={zoom} setZoom={setZoom} fitToScreen={fitToScreen} />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="md:col-span-1 overflow-y-auto no-print bg-background hide-scrollbar m-4 rounded-2xl shadow-sm border">
              <ResumeForm
                resumeData={resumeData}
                setResumeData={setResumeData}
                resumeStyle={resumeStyle}
                setResumeStyle={setResumeStyle}
                templateId={resumeData.templateId}
                photoRequired={photoRequired}
                onTemplateChange={handleTemplateChange}
              />
            </div>
            <div className="md:col-span-1 bg-secondary overflow-hidden relative">
              <ResumePreviewContainer
                resumeData={resumeData}
                templateId={resumeData.templateId}
                resumeStyle={resumeStyle}
                zoom={zoom}
                containerRef={previewContainerRef}
              />
              <ZoomControls zoom={zoom} setZoom={setZoom} fitToScreen={fitToScreen} className="absolute bottom-4 right-4" />
            </div>
          </div>
        )}
      </main>
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        resumeData={resumeData}
        templateId={resumeData.templateId}
        resumeStyle={resumeStyle}
      />

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={downloadResumeRef} style={styleVariables}>
          <TemplateComponent resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
};

export default Editor;