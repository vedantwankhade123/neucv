import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const ExecutiveTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, layout, title } = resumeData;

  const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
      <h3 className="font-semibold tracking-wider border-b pb-1 mb-3" style={{ borderColor: 'var(--accent-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h3>
      {children}
    </div>
  );

  const MainSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <hr style={{ borderColor: 'var(--accent-color)', opacity: 0.3 }} />
      <div className="mt-4">
        {children}
      </div>
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] flex shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', lineHeight: 'var(--line-height)' }}>
      {/* Sidebar */}
      <aside className="w-1/3 pt-10 pl-10 pb-10 pr-8 flex flex-col rounded-lg" style={{ backgroundColor: 'var(--secondary-background-color)', color: 'var(--secondary-font-color)', gap: 'var(--section-spacing)' }}>
        <SidebarSection title="Contact">
          <div className="space-y-3">
            {personalInfo.email && <div className="flex items-center gap-3"><Mail size={14} /><p>{personalInfo.email}</p></div>}
            {personalInfo.phone && <div className="flex items-center gap-3"><Phone size={14} /><p>{personalInfo.phone}</p></div>}
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
                  <p className="font-bold">{edu.degree}</p>
                  <p>{edu.institution}</p>
                  <p className="opacity-70">{edu.startDate} - {edu.endDate}</p>
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
      <main className="w-2/3 p-10" style={{ color: 'var(--primary-font-color)' }}>
        <header style={{ marginBottom: 'var(--section-spacing)' }}>
          <h1 className="text-5xl font-bold tracking-wide">{personalInfo.name || 'Olivia Wilson'}</h1>
          <p className="text-xl font-medium tracking-wider mt-1" style={{ color: 'var(--secondary-font-color)' }}>{title || experience[0]?.role || 'Professional'}</p>
        </header>

        {layout.find(s => s.id === 'summary')?.enabled && (
          <MainSection title="About Me">
            <p className="leading-relaxed">{summary}</p>
          </MainSection>
        )}

        {layout.find(s => s.id === 'experience')?.enabled && (
          <MainSection title="Work Experience">
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id}>
                  <p style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                  <h3 className="font-semibold">{exp.company}</h3>
                  <p className="font-medium mb-1" style={{ color: 'var(--secondary-font-color)' }}>{exp.role}</p>
                  <ul className="list-disc list-inside whitespace-pre-wrap" style={{ color: 'var(--secondary-font-color)' }}>
                    {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {layout.find(s => s.id === 'customSections')?.enabled && customSections?.map(section => (
          section.title && (
            <MainSection key={section.id} title={section.title}>
              <CustomSectionRenderer section={section} />
            </MainSection>
          )
        ))}
      </main>
    </div>
  );
};

export default ExecutiveTemplate;