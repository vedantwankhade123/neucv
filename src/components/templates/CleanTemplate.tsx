import { ResumeData } from '@/types/resume';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

const CleanTemplate = ({ resumeData }: { resumeData: ResumeData }) => {
  const { personalInfo, summary, experience, education, skills, customSections } = resumeData;

  const Section = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={className} style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold tracking-widest" style={{ color: 'var(--accent-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <div className="h-px bg-[var(--accent-color)]/30 w-full my-2"></div>
      {children}
    </div>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      <header className="text-center pb-6 border-b" style={{ borderColor: 'var(--accent-color)' }}>
        <h1 className="text-4xl font-extrabold uppercase tracking-wider">{personalInfo.name || 'Riaan Chandran'}</h1>
        <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1 mt-2" style={{ color: 'var(--secondary-font-color)' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.address && <span>| {personalInfo.address}</span>}
          {personalInfo.github && <div className="w-full mt-1">{personalInfo.github}</div>}
          {personalInfo.linkedin && <div className="w-full mt-1">{personalInfo.linkedin}</div>}
        </div>
      </header>

      <main className="mt-6 grid grid-cols-3 gap-8">
        <div className="col-span-1">
          <Section title="Profile">
            <p className="leading-relaxed">{summary}</p>
          </Section>
          <Section title="Skills">
            <ul className="list-disc list-inside space-y-1">
              {skills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </Section>
          {customSections?.map(section => (
            section.title && (
              <Section key={section.id} title={section.title}>
                <CustomSectionRenderer section={section} />
              </Section>
            )
          ))}
        </div>

        <div className="col-span-2">
          <Section title="Education">
            {education.map(edu => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold">&#8226; {edu.degree}</h3>
                  <p style={{ color: 'var(--secondary-font-color)' }}>{edu.startDate} - {edu.endDate}</p>
                </div>
                <p className="leading-relaxed mt-1 ml-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </Section>
          <Section title="Work Experience">
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold">{exp.company}</h3>
                  <p style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                </div>
                <p className="font-medium mb-1" style={{ color: 'var(--secondary-font-color)' }}>{exp.role}</p>
                <ul className="list-disc list-inside whitespace-pre-wrap mt-1" style={{ color: 'var(--secondary-font-color)' }}>
                  {exp.description.split('\n').map((line, i) => line.trim() && <li key={i} className="pl-1">{line.replace(/^- /, '')}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        </div>
      </main>
    </div>
  );
};

export default CleanTemplate;