import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const ElegantTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const professionalSkills = skills.slice(0, 3);
  const relevantSkills = skills.slice(3, 6);

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold tracking-widest text-[var(--accent-color)]" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <div className="h-[1.5px] w-full mt-1 mb-3" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.2 }}></div>
      {children}
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      <header className="text-center pb-4 border-b-2 border-[var(--accent-color)]">
        <h1 className="text-4xl font-bold tracking-wider">{personalInfo.name || 'DREW FEIG'}</h1>
        <p className="tracking-[0.2em] mt-1" style={{ color: 'var(--secondary-font-color)' }}>{title ? title.toUpperCase() : (experience[0]?.role?.toUpperCase() || 'PROFESSIONAL')}</p>
        <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-3" style={{ color: 'var(--secondary-font-color)' }}>
          <div className="flex items-center gap-1.5"><Mail size={12} /><span>{personalInfo.email}</span></div>
          <div className="flex items-center gap-1.5"><Phone size={12} /><span>{personalInfo.phone}</span></div>
          <div className="flex items-center gap-1.5"><MapPin size={12} /><span>{personalInfo.address}</span></div>
          {personalInfo.linkedin && <div className="flex items-center gap-1.5"><MapPin size={12} /><span>{personalInfo.linkedin}</span></div>}
        </div>
      </header>

      <main className="mt-6">
        <Section title="Profile Summary">
          <p className="leading-relaxed">{summary}</p>
        </Section>

        <div className="grid grid-cols-2 gap-8" style={{ marginBottom: 'var(--section-spacing)' }}>
          <div>
            <h2 className="font-bold tracking-widest text-[var(--accent-color)]" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Professional Skill</h2>
            <div className="h-[1.5px] w-full mt-1 mb-3" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.2 }}></div>
            <ul className="list-disc list-inside space-y-1">
              {professionalSkills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-bold tracking-widest text-[var(--accent-color)]" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Relevant Skill</h2>
            <div className="h-[1.5px] w-full mt-1 mb-3" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.2 }}></div>
            <ul className="list-disc list-inside space-y-1">
              {relevantSkills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </div>
        </div>

        <Section title="Education">
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{edu.institution}</h3>
                <p>{edu.degree}</p>
              </div>
              <p className="font-bold text-[var(--accent-color)]">{edu.endDate}</p>
            </div>
          ))}
        </Section>

        <Section title="Work Experience">
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold">{exp.role}</h3>
                  <p className="font-bold text-[var(--accent-color)]">{exp.endDate}</p>
                </div>
                <p className="font-medium mb-1" style={{ color: 'var(--secondary-font-color)' }}>{exp.company}</p>
                <ul className="list-disc list-inside whitespace-pre-wrap">
                  {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {customSections?.map(section => (
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

export default ElegantTemplate;