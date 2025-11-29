import { ResumeData } from '@/types/resume';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const CorporateBlueTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold uppercase tracking-wider text-[var(--accent-color)]" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <hr className="my-2 border-[var(--accent-color)]/30" />
      {children}
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      <header className="flex justify-between items-start" style={{ marginBottom: 'var(--section-spacing)' }}>
        <div>
          <h1 className="text-4xl font-bold text-[var(--accent-color)]">{personalInfo.name.toUpperCase()}</h1>
          <p className="text-lg font-medium" style={{ color: 'var(--secondary-font-color)' }}>{title || experience[0]?.role || 'Professional'}</p>
          <p className="mt-1" style={{ color: 'var(--secondary-font-color)' }}>{personalInfo.address} | {personalInfo.phone} | {personalInfo.email}</p>
          {personalInfo.linkedin && <p className="mt-1" style={{ color: 'var(--secondary-font-color)' }}>{personalInfo.linkedin}</p>}
        </div>
        <Avatar className="h-24 w-24 flex-shrink-0">
          <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
          <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'HW'}</AvatarFallback>
        </Avatar>
      </header>

      <main>
        <Section title="Summary">
          <p className="leading-relaxed">{summary}</p>
        </Section>

        <Section title="Professional Experience">
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold">{exp.role}, {exp.company}</h3>
                  <p className="font-medium" style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 whitespace-pre-wrap" style={{ color: 'var(--secondary-font-color)' }}>
                  {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Education">
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between items-baseline mb-2">
              <div>
                <h3 className="font-bold">{edu.degree}</h3>
                <p style={{ color: 'var(--secondary-font-color)' }}>{edu.institution}</p>
              </div>
              <p className="font-medium" style={{ color: 'var(--secondary-font-color)' }}>{edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
        </Section>

        <Section title="Technical Skills">
          <div className="grid grid-cols-4 gap-x-4 gap-y-1">
            {skills.map((skill, i) => <p key={i}>{skill}</p>)}
          </div>
        </Section>

        {customSections?.map(section => (
          <Section key={section.id} title={section.title}>
            {(section.organization || (section.startDate && section.endDate)) && (
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold">{section.organization}</h3>
                <p className="font-medium" style={{ color: 'var(--secondary-font-color)' }}>{section.startDate} - {section.endDate}</p>
              </div>
            )}
            <CustomSectionRenderer section={section} />
          </Section>
        ))}
      </main>
    </div>
  );
};

export default CorporateBlueTemplate;