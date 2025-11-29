import { ResumeData } from '@/types/resume';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const ChicTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const Section = ({ title, children, expandable = true }: { title: string, children: React.ReactNode, expandable?: boolean }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <div className="flex justify-between items-center">
        <h2 className="font-bold tracking-widest text-[var(--primary-font-color)]" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
        {expandable && <Plus size={16} className="text-[var(--secondary-font-color)]" />}
      </div>
      <div className="h-px w-full my-2" style={{ backgroundColor: 'var(--accent-color)' }}></div>
      {children}
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] text-[var(--primary-font-color)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', lineHeight: 'var(--line-height)' }}>
      <header className="grid grid-cols-3 gap-8 items-center" style={{ marginBottom: 'var(--section-spacing)' }}>
        <div className="col-span-2">
          <p className="text-lg font-medium tracking-wider">ESTELLE</p>
          <h1 className="text-6xl font-extrabold tracking-tighter text-[var(--accent-color)]">DARCY</h1>
          <p className="text-lg font-medium tracking-wider mt-2">{title ? title.toUpperCase() : (experience[0]?.role?.toUpperCase() || 'PROFESSIONAL')}</p>
        </div>
        <div className="col-span-1 text-right space-y-1 text-[var(--secondary-font-color)]">
          <p>{personalInfo.phone}</p>
          <p>{personalInfo.email}</p>
          <p>{personalInfo.address}</p>
          <p>{personalInfo.linkedin}</p>
        </div>
      </header>

      <main className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <p className="leading-relaxed" style={{ marginBottom: 'var(--section-spacing)' }}>{summary}</p>
          <Section title="Experience">
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <h3 className="font-bold text-[var(--primary-font-color)]">{exp.role}</h3>
                <p className="font-medium text-[var(--secondary-font-color)]">{exp.company} | {exp.startDate} - {exp.endDate}</p>
                <ul className="list-disc list-inside whitespace-pre-wrap mt-1">
                  {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                </ul>
              </div>
            ))}
          </Section>
          <Section title="Education">
            {education.map(edu => (
              <div key={edu.id}>
                <h3 className="font-bold text-[var(--primary-font-color)]">{edu.degree}</h3>
                <p>{edu.institution}, Graduated {edu.endDate}</p>
              </div>
            ))}
          </Section>
          {customSections?.map(section => (
            section.title && (
              <Section key={section.id} title={section.title}>
                <CustomSectionRenderer section={section} />
              </Section>
            )
          ))}
        </div>
        <div className="col-span-1">
          <Avatar className="h-40 w-full rounded-none" style={{ marginBottom: 'var(--section-spacing)' }}>
            <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} className="object-cover" />
            <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'ED'}</AvatarFallback>
          </Avatar>
          <Section title="Skills" expandable={false}>
            <ul className="list-disc list-inside">
              {skills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </Section>
        </div>
      </main>
    </div>
  );

};

export default ChicTemplate;