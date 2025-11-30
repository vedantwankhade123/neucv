import React, { useState } from 'react';
import { ResumeData, LayoutItem, ResumeStyle } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, FileText, Palette, LayoutTemplate, User, Mail, Phone, MapPin, Linkedin, Github, Building2, Calendar, GraduationCap, Sparkles, Loader2, Briefcase } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import LayoutEditor from './LayoutEditor';
import StyleEditor from './StyleEditor';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import TemplateSelector from './TemplateSelector';
import { FloatingLabelInput } from './ui/floating-label-input';
import { FloatingLabelTextarea } from './ui/floating-label-textarea';
import { FormRichTextarea } from './FormRichTextarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateResumeSummary, generateExperienceDescription, generateSkills, generateContextAwareSkills, generateEducationDescription, generateCustomSectionContent } from '@/lib/gemini';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { SummaryGenerationDialog, SummaryGenerationData } from './SummaryGenerationDialog';
import { SkillsGenerationDialog } from './SkillsGenerationDialog';


interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  resumeStyle: ResumeStyle;
  setResumeStyle: React.Dispatch<React.SetStateAction<ResumeStyle>>;
  templateId: string;
  photoRequired?: boolean;
  onTemplateChange: (templateId: string) => void;
}

const ResumeForm = ({ resumeData, setResumeData, resumeStyle, setResumeStyle, templateId, photoRequired, onTemplateChange }: ResumeFormProps) => {
  const [activeTab, setActiveTab] = useState('content');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState<number | null>(null);
  const [activeEducationIndex, setActiveEducationIndex] = useState<number | null>(null);
  const [activeCustomSectionIndex, setActiveCustomSectionIndex] = useState<number | null>(null);
  const [activeCustomItemIndex, setActiveCustomItemIndex] = useState<{ sectionIndex: number; itemIndex: number } | null>(null);
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const predefinedSections = [
    'Projects',
    'Languages',
    'Certifications',
    'Awards',
    'Publications',
    'Volunteer Experience',
  ];

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, [name]: reader.result as string },
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [name]: value },
      }));
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleGenerateSummaryAI = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }

    // Open dialog to ask for summary styles
    setIsSummaryDialogOpen(true);
  };

  const handleDialogGenerate = async (data: SummaryGenerationData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSummary(true);
    setIsSummaryDialogOpen(false);
    try {


      const summary = await generateResumeSummary(
        data.jobTitle || resumeData.title,
        data.experience || resumeData.experience,
        resumeData.education,
        resumeData.skills,
        data.achievements,
        data.tone
      );
      setResumeData(prev => ({ ...prev, summary }));
      toast({ title: "Summary Generated", description: "AI analyzed your resume and generated a professional summary." });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      const errorMessage = error?.message || "Please check your API key or try again.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSmartExperienceGenerate = async (index: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }

    const exp = resumeData.experience[index];

    // Check if role and company are filled
    if (!exp.role || !exp.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in the Role and Company fields before generating descriptions.",
        variant: "destructive"
      });
      return;
    }

    setActiveExperienceIndex(index);
    setIsGeneratingSummary(true);

    try {


      const description = await generateExperienceDescription(
        exp.role,
        exp.company,
        exp.description || '',
        resumeData,
        exp.startDate,
        exp.endDate
      );

      const newExperience = [...resumeData.experience];
      // If there's existing content, append; otherwise replace
      if (exp.description && exp.description.length > 10) {
        newExperience[index] = { ...newExperience[index], description };
        toast({ title: "Experience Enhanced", description: "AI analyzed and improved your experience description." });
      } else {
        newExperience[index] = { ...newExperience[index], description };
        toast({ title: "Experience Generated", description: "AI analyzed your role and generated professional bullet points." });
      }

      setResumeData(prev => ({ ...prev, experience: newExperience }));
    } catch (error: any) {
      console.error("Error generating experience:", error);
      const errorMessage = error?.message || "Please check your API key.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
      setActiveExperienceIndex(null);
    }
  };

  const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newExperience = [...resumeData.experience];
    newExperience[index] = { ...newExperience[index], [name]: value };
    setResumeData(prev => ({ ...prev, experience: newExperience }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' }],
    }));
  };

  const removeExperience = (index: number) => {
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    setResumeData(prev => ({ ...prev, experience: newExperience }));
  };

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newEducation = [...resumeData.education];
    newEducation[index] = { ...newEducation[index], [name]: value };
    setResumeData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: uuidv4(), institution: '', degree: '', startDate: '', endDate: '' }],
    }));
  };

  const removeEducation = (index: number) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index);
    setResumeData(prev => ({ ...prev, education: newEducation }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setResumeData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleCustomSectionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newCustomSections = [...(resumeData.customSections || [])];
    newCustomSections[index] = { ...newCustomSections[index], [name]: value };
    setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
  };

  const handleAddCustomSection = (title: string = '', type: 'text' | 'list' | 'experience' = 'text') => {
    setResumeData(prev => {
      // Ensure 'customSections' is enabled in layout
      const newLayout = prev.layout.map(item =>
        item.id === 'customSections' ? { ...item, enabled: true } : item
      );

      // If customSections doesn't exist in layout, add it
      if (!newLayout.find(item => item.id === 'customSections')) {
        newLayout.push({ id: 'customSections', name: 'Custom Sections', enabled: true });
      }

      // Determine section type based on title
      let sectionType: 'text' | 'list' | 'experience' = type;
      if (title === 'Languages') {
        sectionType = 'list';
      } else if (['Certifications', 'Awards', 'Publications', 'Volunteer Experience', 'Projects'].includes(title)) {
        sectionType = 'experience';
      }

      // Initialize items based on type
      const initialItems = sectionType === 'list' || sectionType === 'experience'
        ? [{ id: uuidv4(), description: '', title: '', subtitle: '', startDate: '', endDate: '' }]
        : [];

      return {
        ...prev,
        layout: newLayout,
        customSections: [...(prev.customSections || []), {
          id: uuidv4(),
          title: title || 'New Section',
          type: sectionType,
          content: '',
          items: initialItems,
          organization: '',
          startDate: '',
          endDate: ''
        }],
      };
    });

    // Show success message
    toast({
      title: "Section Added",
      description: `Added "${title || 'New Section'}" to your resume.`,
    });
  };

  const removeCustomSection = (index: number) => {
    const newCustomSections = (resumeData.customSections || []).filter((_, i) => i !== index);
    setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
  };

  const handleGenerateCustomSectionContent = async (sectionIndex: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }

    const section = resumeData.customSections[sectionIndex];
    if (!section) return;

    setActiveCustomSectionIndex(sectionIndex);
    setIsGeneratingSummary(true);

    try {


      const keywords = section.organization || section.content || '';
      const content = await generateCustomSectionContent(
        section.title || 'Custom Section',
        section.type || 'text',
        keywords,
        resumeData
      );

      const newCustomSections = [...resumeData.customSections];
      if (section.type === 'text') {
        newCustomSections[sectionIndex] = { ...section, content };
      } else {
        // For list and experience types, we'll add to the first item or create one
        const items = section.items || [];
        if (items.length > 0) {
          items[0] = { ...items[0], description: content };
        } else {
          items.push({
            id: uuidv4(),
            description: content,
            title: '',
            subtitle: '',
            startDate: '',
            endDate: ''
          });
        }
        newCustomSections[sectionIndex] = { ...section, items };
      }

      setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
      toast({ title: "Content Generated", description: "AI-generated content added successfully." });
    } catch (error: any) {
      console.error("Error generating custom section content:", error);
      const errorMessage = error?.message || "Please check your API key.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
      setActiveCustomSectionIndex(null);
    }
  };

  const handleGenerateCustomItemDescription = async (sectionIndex: number, itemIndex: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }

    const section = resumeData.customSections[sectionIndex];
    const item = section?.items?.[itemIndex];
    if (!section || !item) return;

    setActiveCustomItemIndex({ sectionIndex, itemIndex });
    setIsGeneratingSummary(true);

    try {


      const keywords = item.title || item.subtitle || item.description || '';
      const content = await generateCustomSectionContent(
        section.title || 'Custom Section',
        section.type || 'text',
        keywords,
        resumeData
      );

      const newCustomSections = [...resumeData.customSections];
      const newItems = [...(section.items || [])];
      newItems[itemIndex] = { ...item, description: content };
      newCustomSections[sectionIndex] = { ...section, items: newItems };

      setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
      toast({ title: "Description Generated", description: "AI-generated description added successfully." });
    } catch (error: any) {
      console.error("Error generating item description:", error);
      const errorMessage = error?.message || "Please check your API key.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
      setActiveCustomItemIndex(null);
    }
  };

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setResumeData(prev => ({ ...prev, layout: newLayout }));
  };

  const toggleSection = (id: string) => {
    const newLayout = resumeData.layout.map(section =>
      section.id === id ? { ...section, enabled: !section.enabled } : section
    );
    setResumeData(prev => ({ ...prev, layout: newLayout }));
  };

  const sectionComponents = {
    summary: (
      <AccordionItem value="summary" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold p-4 bg-muted rounded-lg hover:no-underline border">Professional Summary</AccordionTrigger>
        <AccordionContent className="pt-6 px-2">
          <div className="flex justify-end mb-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerateSummaryAI} disabled={isGeneratingSummary} className="text-xs">
              {isGeneratingSummary ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3 text-purple-500" />}
              Generate with AI
            </Button>
          </div>
          <FloatingLabelTextarea id="summary" name="summary" label="Professional Summary" value={resumeData.summary} onChange={handleSummaryChange} rows={5} />
        </AccordionContent>
      </AccordionItem>
    ),
    experience: (
      <AccordionItem value="experience" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold p-4 bg-muted rounded-lg hover:no-underline border">Work Experience</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-6 px-2">
          {resumeData.experience.map((exp, index) => (
            <Card key={exp.id} className="bg-card">
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">{exp.role || 'New Experience'}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-purple-200 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 text-purple-600 font-medium"
                      onClick={() => handleSmartExperienceGenerate(index)}
                      disabled={isGeneratingSummary && activeExperienceIndex === index}
                      title="Generate with AI"
                    >
                      {isGeneratingSummary && activeExperienceIndex === index ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => removeExperience(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <FloatingLabelInput id={`exp-role-${index}`} name="role" label="Role" value={exp.role} onChange={(e) => handleExperienceChange(index, e)} icon={User} />
                <FloatingLabelInput id={`exp-company-${index}`} name="company" label="Company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} icon={Building2} />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput id={`exp-startDate-${index}`} name="startDate" label="Start Date" value={exp.startDate} onChange={(e) => handleExperienceChange(index, e)} icon={Calendar} />
                  <FloatingLabelInput id={`exp-endDate-${index}`} name="endDate" label="End Date" value={exp.endDate} onChange={(e) => handleExperienceChange(index, e)} icon={Calendar} />
                </div>
                <FormRichTextarea id={`exp-desc-${index}`} name="description" label="Description" value={exp.description} onChange={(e) => handleExperienceChange(index, e)} rows={4} />
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addExperience} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
        </AccordionContent>
      </AccordionItem>
    ),
    education: (
      <AccordionItem value="education" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold p-4 bg-muted rounded-lg hover:no-underline border">Education</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-6 px-2">
          {resumeData.education.map((edu, index) => (
            <Card key={edu.id} className="bg-card">
              <CardHeader className="p-4"><div className="flex justify-between items-center"><CardTitle className="text-base font-medium">{edu.degree || 'New Education'}</CardTitle><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4" /></Button></div></CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <FloatingLabelInput id={`edu-institution-${index}`} name="institution" label="Institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} icon={Building2} />
                <FloatingLabelInput id={`edu-degree-${index}`} name="degree" label="Degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} icon={GraduationCap} />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput id={`edu-startDate-${index}`} name="startDate" label="Start Date" value={edu.startDate} onChange={(e) => handleEducationChange(index, e)} icon={Calendar} />
                  <FloatingLabelInput id={`edu-endDate-${index}`} name="endDate" label="End Date" value={edu.endDate} onChange={(e) => handleEducationChange(index, e)} icon={Calendar} />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addEducation} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
        </AccordionContent>
      </AccordionItem>
    ),
    skills: (
      <AccordionItem value="skills" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold p-4 bg-muted rounded-lg hover:no-underline border">Skills</AccordionTrigger>
        <AccordionContent className="pt-6 px-2">
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" disabled={isGeneratingSummary} onClick={() => setIsSkillsDialogOpen(true)} className="text-xs">
              {isGeneratingSummary ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3 text-purple-500" />}
              Generate Skills
            </Button>
          </div>
          <div className="space-y-2">
            <FloatingLabelTextarea id="skills" name="skills" label="Skills" value={resumeData.skills.join(', ')} onChange={handleSkillsChange} />
            <p className="text-xs text-muted-foreground px-3">Separate skills with a comma (e.g., React, Node.js, TypeScript).</p>
          </div>
        </AccordionContent>
      </AccordionItem >
    ),
    customSections: (
      <AccordionItem value="customSections" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold p-4 bg-muted rounded-lg hover:no-underline border">Custom Sections</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-6 px-2">
          {(!resumeData.customSections || resumeData.customSections.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No custom sections yet. Use the "Add Section" button below to add one.</p>
            </div>
          ) : (
            resumeData.customSections.map((section, index) => (
              <Card key={section.id} className="bg-card">
                <CardHeader className="p-4"><div className="flex justify-between items-center"><CardTitle className="text-base font-medium">{section.title || 'New Section'}</CardTitle><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => removeCustomSection(index)}><Trash2 className="h-4 w-4" /></Button></div></CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {/* Languages section - only show list items, no title/org/dates/AI */}
                  {section.title === 'Languages' && section.type === 'list' && (
                    <div className="space-y-3">
                      {section.items?.map((item, itemIndex) => (
                        <div key={item.id} className="flex gap-2 items-start">
                          <div className="flex-grow">
                            <FloatingLabelInput
                              id={`custom-${index}-item-${itemIndex}-desc`}
                              name="description"
                              label="Language"
                              value={item.description || ''}
                              onChange={(e) => {
                                const newItems = [...(section.items || [])];
                                newItems[itemIndex] = { ...newItems[itemIndex], description: e.target.value };
                                const newCustomSections = [...resumeData.customSections];
                                newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                              }}
                              placeholder="e.g. English (Native), Spanish (Fluent)"
                            />
                          </div>
                          <Button variant="ghost" size="icon" className="mt-1 text-muted-foreground hover:text-red-500" onClick={() => {
                            const newItems = section.items?.filter((_, i) => i !== itemIndex);
                            const newCustomSections = [...resumeData.customSections];
                            newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                            setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => {
                        const newItems = [...(section.items || []), { id: uuidv4(), description: '' }];
                        const newCustomSections = [...resumeData.customSections];
                        newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                        setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                      }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Language
                      </Button>
                    </div>
                  )}

                  {/* Show section title only if not Languages */}
                  {section.title !== 'Languages' && (
                    <FloatingLabelInput id={`custom-title-${index}`} name="title" label="Section Title" value={section.title} onChange={(e) => handleCustomSectionChange(index, e)} />
                  )}

                  {(!section.type || section.type === 'text') && section.title !== 'Languages' && (
                    <>
                      <FloatingLabelInput id={`custom-organization-${index}`} name="organization" label="Organization / Institution (Optional)" value={section.organization || ''} onChange={(e) => handleCustomSectionChange(index, e)} icon={Building2} />
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingLabelInput id={`custom-startDate-${index}`} name="startDate" label="Start Date (Optional)" value={section.startDate || ''} onChange={(e) => handleCustomSectionChange(index, e)} icon={Calendar} />
                        <FloatingLabelInput id={`custom-endDate-${index}`} name="endDate" label="End Date (Optional)" value={section.endDate || ''} onChange={(e) => handleCustomSectionChange(index, e)} icon={Calendar} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateCustomSectionContent(index)}
                            disabled={isGeneratingSummary && activeCustomSectionIndex === index}
                            className="text-xs"
                          >
                            {isGeneratingSummary && activeCustomSectionIndex === index ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-3 w-3 text-purple-500" />
                            )}
                            Generate with AI
                          </Button>
                        </div>
                        <FormRichTextarea id={`custom-content-${index}`} name="content" label="Content" value={section.content} onChange={(e) => handleCustomSectionChange(index, e)} rows={4} />
                        <p className="text-xs text-muted-foreground px-3">
                          Use <code className="font-mono bg-muted p-0.5 rounded-sm"># Heading</code> for titles. Use the toolbar for bold and bullets.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Generic list section - only for non-Languages */}
                  {section.type === 'list' && section.title !== 'Languages' && (
                    <div className="space-y-3">
                      {section.items?.map((item, itemIndex) => (
                        <div key={item.id} className="flex gap-2 items-start">
                          <div className="flex-grow space-y-2">
                            <div className="flex justify-end mb-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-purple-500"
                                onClick={() => handleGenerateCustomItemDescription(index, itemIndex)}
                                disabled={isGeneratingSummary && activeCustomItemIndex?.sectionIndex === index && activeCustomItemIndex?.itemIndex === itemIndex}
                                title="Generate with AI"
                              >
                                {isGeneratingSummary && activeCustomItemIndex?.sectionIndex === index && activeCustomItemIndex?.itemIndex === itemIndex ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <FloatingLabelInput
                              id={`custom-${index}-item-${itemIndex}-desc`}
                              name="description"
                              label="Item Description"
                              value={item.description || ''}
                              onChange={(e) => {
                                const newItems = [...(section.items || [])];
                                newItems[itemIndex] = { ...newItems[itemIndex], description: e.target.value };
                                const newCustomSections = [...resumeData.customSections];
                                newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                              }}
                            />
                          </div>
                          <Button variant="ghost" size="icon" className="mt-1 text-muted-foreground hover:text-red-500" onClick={() => {
                            const newItems = section.items?.filter((_, i) => i !== itemIndex);
                            const newCustomSections = [...resumeData.customSections];
                            newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                            setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => {
                        const newItems = [...(section.items || []), { id: uuidv4(), description: '' }];
                        const newCustomSections = [...resumeData.customSections];
                        newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                        setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                      }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                      </Button>
                    </div>
                  )}

                  {/* Generic experience section - only for non-Certifications */}
                  {section.type === 'experience' && section.title !== 'Certifications' && (
                    <div className="space-y-4">
                      {section.items?.map((item, itemIndex) => (
                        <Card key={item.id} className="bg-muted/50">
                          <CardContent className="p-3 space-y-3">
                            <div className="flex justify-between items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-purple-500"
                                onClick={() => handleGenerateCustomItemDescription(index, itemIndex)}
                                disabled={isGeneratingSummary && activeCustomItemIndex?.sectionIndex === index && activeCustomItemIndex?.itemIndex === itemIndex}
                                title="Generate Description with AI"
                              >
                                {isGeneratingSummary && activeCustomItemIndex?.sectionIndex === index && activeCustomItemIndex?.itemIndex === itemIndex ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => {
                                const newItems = section.items?.filter((_, i) => i !== itemIndex);
                                const newCustomSections = [...resumeData.customSections];
                                newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                              }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <FloatingLabelInput
                              id={`custom-${index}-item-${itemIndex}-title`}
                              name="title"
                              label="Title / Role"
                              value={item.title || ''}
                              onChange={(e) => {
                                const newItems = [...(section.items || [])];
                                newItems[itemIndex] = { ...newItems[itemIndex], title: e.target.value };
                                const newCustomSections = [...resumeData.customSections];
                                newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                              }}
                              icon={User}
                            />
                            <FloatingLabelInput
                              id={`custom-${index}-item-${itemIndex}-subtitle`}
                              name="subtitle"
                              label="Subtitle / Organization"
                              value={item.subtitle || ''}
                              onChange={(e) => {
                                const newItems = [...(section.items || [])];
                                newItems[itemIndex] = { ...newItems[itemIndex], subtitle: e.target.value };
                                const newCustomSections = [...resumeData.customSections];
                                newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                              }}
                              icon={Building2}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FloatingLabelInput
                                id={`custom-${index}-item-${itemIndex}-start`}
                                name="startDate"
                                label="Start Date"
                                value={item.startDate || ''}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIndex] = { ...newItems[itemIndex], startDate: e.target.value };
                                  const newCustomSections = [...resumeData.customSections];
                                  newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                  setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                                }}
                                icon={Calendar}
                              />
                              <FloatingLabelInput
                                id={`custom-${index}-item-${itemIndex}-end`}
                                name="endDate"
                                label="End Date"
                                value={item.endDate || ''}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIndex] = { ...newItems[itemIndex], endDate: e.target.value };
                                  const newCustomSections = [...resumeData.customSections];
                                  newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                  setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                                }}
                                icon={Calendar}
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-end mb-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGenerateCustomItemDescription(index, itemIndex)}
                                  disabled={isGeneratingSummary && activeCustomItemIndex?.sectionIndex === index && activeCustomItemIndex?.itemIndex === itemIndex}
                                  className="text-xs"
                                >
                                  {isGeneratingSummary && activeCustomItemIndex?.sectionIndex === index && activeCustomItemIndex?.itemIndex === itemIndex ? (
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="mr-2 h-3 w-3 text-purple-500" />
                                  )}
                                  Generate Description
                                </Button>
                              </div>
                              <FormRichTextarea
                                id={`custom-${index}-item-${itemIndex}-desc`}
                                name="description"
                                label="Description"
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIndex] = { ...newItems[itemIndex], description: e.target.value };
                                  const newCustomSections = [...resumeData.customSections];
                                  newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                                  setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                                }}
                                rows={3}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => {
                        const newItems = [...(section.items || []), { id: uuidv4(), title: '', subtitle: '', description: '' }];
                        const newCustomSections = [...resumeData.customSections];
                        newCustomSections[index] = { ...newCustomSections[index], items: newItems };
                        setResumeData(prev => ({ ...prev, customSections: newCustomSections }));
                      }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                      </Button>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))
          )}

        </AccordionContent>
      </AccordionItem>
    ),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="relative w-full max-w-md mx-auto bg-muted p-1 rounded-full flex border border-foreground/20">
        <span
          className="absolute top-1 bottom-1 left-1 w-[calc(33.33%-4px)] bg-primary shadow-sm rounded-full transition-transform duration-300 ease-in-out"
          style={{
            transform: activeTab === 'content' ? 'translateX(0%)' : activeTab === 'design' ? 'translateX(100%)' : 'translateX(200%)',
          }}
        />
        <button
          onClick={() => setActiveTab('content')}
          className={`relative z-10 w-1/3 py-2.5 rounded-full flex items-center justify-center transition-colors duration-300 text-sm font-medium ${activeTab === 'content' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
        >
          <FileText className="mr-2 h-4 w-4" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`relative z-10 w-1/3 py-2.5 rounded-full flex items-center justify-center transition-colors duration-300 text-sm font-medium ${activeTab === 'design' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
        >
          <Palette className="mr-2 h-4 w-4" />
          Design
        </button>
        <button
          onClick={() => setActiveTab('template')}
          className={`relative z-10 w-1/3 py-2.5 rounded-full flex items-center justify-center transition-colors duration-300 text-sm font-medium ${activeTab === 'template' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
        >
          <LayoutTemplate className="mr-2 h-4 w-4" />
          Template
        </button>
      </div>

      {activeTab === 'design' ? (
        <div className="space-y-8 p-2">
          <div>
            <h3 className="text-lg font-semibold mb-4">Layout</h3>
            <LayoutEditor
              layout={resumeData.layout}
              onLayoutChange={handleLayoutChange}
              onToggleSection={toggleSection}
            />
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Style</h3>
            <StyleEditor styles={resumeStyle} setStyles={setResumeStyle} templateId={templateId} />
          </div>
        </div>
      ) : activeTab === 'template' ? (
        <TemplateSelector onSelectTemplate={onTemplateChange} />
      ) : (
        <div className="w-full space-y-4">
          <Card className="bg-card">
            <CardHeader className="p-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Role / Target Position
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <FloatingLabelInput
                id="job-role"
                name="title"
                label="Job Role / Target Position"
                value={resumeData.title || ''}
                onChange={handleTitleChange}
                icon={Briefcase}
                placeholder="e.g. Senior Software Engineer, Product Manager"
              />
              <p className="text-xs text-muted-foreground mt-2 px-3">
                This is the role you're applying for. It helps AI generate tailored content for your resume.
              </p>
            </CardContent>
          </Card>
          <Accordion type="single" collapsible defaultValue="personal-info" className="w-full space-y-4">
            <AccordionItem value="personal-info" className="border-b-0">
              <AccordionTrigger className="text-lg font-semibold p-4 bg-muted rounded-lg hover:no-underline border">Personal Information</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-6 px-2">
                {photoRequired && (
                  <div className="space-y-2">
                    <Label htmlFor="photoUrl">Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={resumeData.personalInfo.photoUrl || '/placeholder.svg'} alt={resumeData.personalInfo.name} />
                        <AvatarFallback>{resumeData.personalInfo.name ? resumeData.personalInfo.name.slice(0, 2).toUpperCase() : 'JD'}</AvatarFallback>
                      </Avatar>
                      <Input id="photoUrl" name="photoUrl" type="file" accept="image/*" onChange={handlePersonalInfoChange} className="flex-grow" />
                    </div>
                  </div>
                )}
                <FloatingLabelInput id="name" name="name" label="Full Name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} icon={User} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingLabelInput id="email" name="email" type="email" label="Email Address" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} icon={Mail} />
                  <FloatingLabelInput id="phone" name="phone" label="Phone Number" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} icon={Phone} />
                </div>
                <FloatingLabelInput id="address" name="address" label="Address" value={resumeData.personalInfo.address} onChange={handlePersonalInfoChange} icon={MapPin} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingLabelInput id="linkedin" name="linkedin" label="LinkedIn Profile" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} icon={Linkedin} />
                  <FloatingLabelInput id="github" name="github" label="GitHub Profile" value={resumeData.personalInfo.github} onChange={handlePersonalInfoChange} icon={Github} />
                </div>
              </AccordionContent>
            </AccordionItem>

            {resumeData.layout.map(section => (
              section.enabled && (
                <React.Fragment key={section.id}>
                  {sectionComponents[section.id as keyof typeof sectionComponents]}
                </React.Fragment>
              )
            ))}
          </Accordion>
        </div>
      )}

      {activeTab === 'content' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {predefinedSections.map((title) => (
              <DropdownMenuItem key={title} onClick={() => {
                // Languages should be list type, others should be experience type
                const type = title === 'Languages' ? 'list' : 'experience';
                handleAddCustomSection(title, type);
              }}>
                {title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <SkillsGenerationDialog
        open={isSkillsDialogOpen}
        onOpenChange={setIsSkillsDialogOpen}
        onGenerate={async (count) => {
          if (!user) {
            toast({
              title: "Authentication Required",
              description: "Please sign in to use AI features.",
              variant: "destructive"
            });
            setIsSkillsDialogOpen(false);
            return;
          }

          setIsGeneratingSummary(true);
          try {
            const skillsText = await generateContextAwareSkills(resumeData, count);
            const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
            setResumeData(prev => ({ ...prev, skills: [...(prev.skills || []), ...skillsArray] }));
            toast({ title: "Skills Generated", description: `Added ${skillsArray.length} skills based on your profile.` });
            setIsSkillsDialogOpen(false);
          } catch (error: any) {
            console.error("Error generating skills:", error);
            const errorMessage = error?.message || "Please check your API key.";
            toast({
              title: "Generation Failed",
              description: errorMessage,
              variant: "destructive"
            });
          } finally {
            setIsGeneratingSummary(false);
          }
        }}
      />
      <SummaryGenerationDialog
        open={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        onGenerate={handleDialogGenerate}
        initialJobTitle={resumeData.title || ''}
        initialExperience={resumeData.experience.length > 0 ? `${Math.max(1, Math.floor(resumeData.experience.length * 1.5))}+ years` : ''}
      />
    </div>
  );
};

export default ResumeForm;