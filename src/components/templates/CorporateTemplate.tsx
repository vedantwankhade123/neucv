import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const CorporateTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, layout, title } = resumeData;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold tracking-widest" style={{ color: 'var(--secondary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <div className="h-px w-12 my-2" style={{ backgroundColor: 'var(--accent-color)' }}></div>
      {children}
    </div>
  );

  const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
      <h3 className="font-semibold tracking-wider border-b pb-1 mb-3" style={{ color: 'var(--secondary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h3>
      <div className="h-px w-10 my-2" style={{ backgroundColor: 'var(--accent-color)' }}></div>
      {children}
    </div>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] flex shadow-lg" style={{ lineHeight: 'var(--line-height)' }}>
      {/* Sidebar */}
      <aside className="w-1/3 flex flex-col" style={{ backgroundColor: 'var(--secondary-background-color)', color: 'var(--secondary-font-color)', padding: 'var(--page-margins)', gap: 'var(--section-spacing)' }}>
        <div className="flex justify-center">
          <Avatar className="h-32 w-32 border-4 border-white">
            <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
            <AvatarFallback>{personalInfo.name ? personalInfo.name.charAt(0) : 'A'}</AvatarFallback>
          </Avatar>
        </div>

        <SidebarSection title="Contact">
          <div className="space-y-3">
            {personalInfo.phone && <div className="flex items-center gap-3"><Phone size={14} /><p>{personalInfo.phone}</p></div>}
            {personalInfo.email && <div className="flex items-center gap-3"><Mail size={14} /><p>{personalInfo.email}</p></div>}
            {personalInfo.address && <div className="flex items-center gap-3"><MapPin size={14} /><p>{personalInfo.address}</p></div>}
            {personalInfo.github && <div className="flex items-center gap-3"><Globe size={14} /><p>{personalInfo.github}</p></div>}
            {personalInfo.linkedin && <div className="flex items-center gap-3"><Globe size={14} /><p>{personalInfo.linkedin}</p></div>}
          </div>
        </SidebarSection>

        {layout.find(s => s.id === 'education')?.enabled && (
          <SidebarSection title="Education">
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <p className="font-bold">{edu.startDate} - {edu.endDate}</p>
                  <p>{edu.institution}</p>
                  <p style={{ color: 'var(--accent-color)' }}>{edu.degree}</p>
                </div>
              ))}
            </div>
          </SidebarSection>
        )}

        {layout.find(s => s.id === 'skills')?.enabled && (
          <SidebarSection title="Skills">
            <ul className="space-y-1 list-disc list-inside">
              {skills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </SidebarSection>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3" style={{ backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', padding: 'var(--page-margins)' }}>
        <header style={{ marginBottom: 'var(--section-spacing)' }}>
          <h1 className="text-4xl font-bold tracking-wide break-words">{personalInfo.name || 'Richard Sanchez'}</h1>
          <p className="text-lg font-medium tracking-wider mt-1" style={{ color: 'var(--secondary-font-color)' }}>{title || experience[0]?.role || 'Professional'}</p>
        </header>

        {layout.find(s => s.id === 'summary')?.enabled && (
          <Section title="Profile">
            <p className="leading-relaxed">{summary}</p>
          </Section>
        )}

        {layout.find(s => s.id === 'experience')?.enabled && (
          <Section title="Work Experience">
            <div className="relative">
              <div className="absolute left-1.5 top-1 w-0.5 h-full bg-[var(--accent-color)]/30"></div>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-semibold break-words" style={{ fontSize: 'var(--heading-font-size)' }}>{exp.company}</h3>
                      <p className="flex-shrink-0" style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <p className="font-medium mb-1" style={{ color: 'var(--secondary-font-color)' }}>{exp.role}</p>
                    <ul className="list-disc list-inside whitespace-pre-wrap" style={{ color: 'var(--secondary-font-color)' }}>
                      {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {layout.find(s => s.id === 'customSections')?.enabled && customSections?.map(section => (
          section.title && (
            <Section key={section.id} title={section.title}>
              <CustomSectionRenderer section={section} />
            </Section>
          )
        ))}
      </main>
    </div>
  );
};

export default CorporateTemplate;