import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const CrispTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, layout, title } = resumeData;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold tracking-[0.2em]" style={{ color: 'var(--secondary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <div className="h-px w-full my-2" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.2 }}></div>
      {children}
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg flex gap-8" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      {/* Left Column */}
      <div className="w-[65%]">
        <header className="text-left" style={{ marginBottom: 'var(--section-spacing)' }}>
          <h1 className="text-4xl font-bold tracking-wider">{personalInfo.name || 'LORNA ALVARADO'}</h1>
          <p className="tracking-[0.2em] mt-1" style={{ color: 'var(--secondary-font-color)' }}>{title ? title.toUpperCase() : (experience[0]?.role?.toUpperCase() || 'PROFESSIONAL')}</p>
        </header>

        {layout.find(s => s.id === 'summary')?.enabled && (
          <Section title="Profile">
            <p className="leading-relaxed">{summary}</p>
          </Section>
        )}

        {layout.find(s => s.id === 'experience')?.enabled && (
          <Section title="Work Experience">
            <div className="relative">
              <div className="absolute left-[5px] top-1 w-px h-full" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.2 }}></div>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--primary-background-color)' }}></div>
                    <p className="font-bold" style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                    <p style={{ color: 'var(--secondary-font-color)' }}>{exp.company}</p>
                    <h3 className="font-semibold">{exp.role}</h3>
                    <ul className="list-disc list-inside whitespace-pre-wrap mt-1" style={{ color: 'var(--secondary-font-color)' }}>
                      {exp.description.split('\n').map((line, i) => line.trim() && <li key={i} className="pl-1">{line.replace(/^- /, '')}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Right Column */}
      <div className="w-[35%] border-l pl-8 pt-2" style={{ borderColor: 'var(--accent-color)', opacity: 0.2 }}>
        <div className="space-y-3 mb-10">
          {personalInfo.phone && <div className="flex items-center gap-3"><Phone size={14} className="text-[var(--secondary-font-color)]" /><span>{personalInfo.phone}</span></div>}
          {personalInfo.email && <div className="flex items-center gap-3"><Mail size={14} className="text-[var(--secondary-font-color)]" /><span>{personalInfo.email}</span></div>}
          {personalInfo.address && <div className="flex items-center gap-3"><MapPin size={14} className="text-[var(--secondary-font-color)]" /><span>{personalInfo.address}</span></div>}
          {personalInfo.github && <div className="flex items-center gap-3"><Globe size={14} className="text-[var(--secondary-font-color)]" /><span>{personalInfo.github}</span></div>}
          {personalInfo.linkedin && <div className="flex items-center gap-3"><Globe size={14} className="text-[var(--secondary-font-color)]" /><span>{personalInfo.linkedin}</span></div>}
        </div>

        {layout.find(s => s.id === 'education')?.enabled && (
          <Section title="Education">
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <p className="font-bold">{edu.startDate} - {edu.endDate}</p>
                  <p className="font-semibold">{edu.institution}</p>
                  <p style={{ color: 'var(--secondary-font-color)' }}>{edu.degree}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {layout.find(s => s.id === 'skills')?.enabled && (
          <Section title="Skills">
            <ul className="space-y-1 list-disc list-inside">
              {skills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </Section>
        )}

        {customSections?.map(section => (
          section.title && layout.find(s => s.id === 'customSections')?.enabled && (
            <Section key={section.id} title={section.title}>
              {(section.organization || (section.startDate && section.endDate)) && (
                <div className="mb-2">
                  <p className="font-bold">{section.startDate} - {section.endDate}</p>
                  <p className="font-semibold">{section.organization}</p>
                </div>
              )}
              <CustomSectionRenderer section={section} />
            </Section>
          )
        ))}
      </div>
    </div>
  );
};

export default CrispTemplate;