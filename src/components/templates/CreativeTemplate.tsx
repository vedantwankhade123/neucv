import { ResumeData } from '@/types/resume';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const CreativeTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, layout } = resumeData;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-semibold text-[var(--accent-color)] mb-3" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      {children}
    </section>
  );

  const mainSectionComponents = {
    summary: (
      <Section title="About Me">
        <p className="leading-relaxed">{summary}</p>
      </Section>
    ),
    experience: (
      <Section title="Experience">
        {experience.map((exp) => (
          <div key={exp.id} className="mb-4">
            <h3 className="font-semibold">{exp.role || 'Job Title'}</h3>
            <p className="font-medium" style={{ color: 'var(--secondary-font-color)' }}>{exp.company || 'Company Name'} / {exp.startDate} - {exp.endDate}</p>
            <ul className="mt-2 list-none whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--secondary-font-color)' }}>{exp.description.split('\n').map((line, i) => line.trim() && <li key={i} className="pl-4 relative before:content-['\2022'] before:text-[var(--accent-color)] before:font-bold before:inline-block before:w-4 before:-ml-4">{line.replace(/^- /, '')}</li>)}</ul>
          </div>
        ))}
      </Section>
    ),
    education: null, // In sidebar
    skills: null, // In sidebar
    customSections: (
      <>
        {customSections?.map(section => (
          section.title && (
            <Section key={section.id} title={section.title}>
              {(section.organization || (section.startDate && section.endDate)) && (
                <p className="font-medium mb-2" style={{ color: 'var(--secondary-font-color)' }}>
                  {section.organization}
                  {section.organization && (section.startDate || section.endDate) ? ' / ' : ''}
                  {section.startDate || section.endDate ? `${section.startDate || ''} - ${section.endDate || ''}` : ''}
                </p>
              )}
              <CustomSectionRenderer section={section} />
            </Section>
          )
        ))}
      </>
    ),
  };

  const sidebarSectionComponents = {
    skills: (
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">{skills.filter(skill => skill).map((skill, index) => (<Badge key={index} style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-background-color)' }} className="hover:opacity-90 rounded-full px-3 py-1">{skill}</Badge>))}</div>
      </Section>
    ),
    education: (
      <Section title="Education">
        {education.map((edu) => (<div key={edu.id} className="mb-2"><h3 className="font-semibold">{edu.degree || 'Degree'}</h3><p className="font-medium" style={{ color: 'var(--secondary-font-color)' }}>{edu.institution || 'Institution Name'}</p><p style={{ color: 'var(--secondary-font-color)' }}>{edu.endDate || 'End Date'}</p></div>))}
      </Section>
    ),
  };

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      <header className="flex items-center justify-between mb-8 border-b-4 border-[var(--accent-color)] pb-4">
        <div><h1 className="text-5xl font-bold tracking-tighter">{personalInfo.name || 'Your Name'}</h1><p className="text-lg" style={{ color: 'var(--secondary-font-color)' }}>Creative Professional</p></div>
        <div className="text-right space-y-1" style={{ color: 'var(--secondary-font-color)' }}>
          {personalInfo.email && <div className="flex items-center justify-end gap-1.5"><Mail size={12} /><span>{personalInfo.email}</span></div>}
          {personalInfo.phone && <div className="flex items-center justify-end gap-1.5"><Phone size={12} /><span>{personalInfo.phone}</span></div>}
          {personalInfo.address && <div className="flex items-center justify-end gap-1.5"><MapPin size={12} /><span>{personalInfo.address}</span></div>}
        </div>
      </header>
      <main className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {layout.map(section => section.enabled && mainSectionComponents[section.id as keyof typeof mainSectionComponents])}
        </div>
        <aside className="col-span-1 p-4 rounded" style={{ backgroundColor: 'var(--secondary-background-color)' }}>
          {layout.map(section => section.enabled && sidebarSectionComponents[section.id as keyof typeof sidebarSectionComponents])}
          <Section title="Links">
            <div className="space-y-2">
              {personalInfo.linkedin && <div className="flex items-center gap-1.5"><Linkedin size={14} /><span>LinkedIn</span></div>}
              {personalInfo.github && <div className="flex items-center gap-1.5"><Github size={14} /><span>GitHub</span></div>}
            </div>
          </Section>
        </aside>
      </main>
    </div>
  );
};

export default CreativeTemplate;