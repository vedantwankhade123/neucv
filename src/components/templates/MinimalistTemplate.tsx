import { ResumeData } from '@/types/resume';
import { Phone, Mail, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '../CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const MinimalistTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold tracking-widest" style={{ color: 'var(--primary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <hr className="my-2" style={{ borderColor: 'var(--accent-color)' }} />
      {children}
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      <header className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 rounded-md">
            <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
            <AvatarFallback className="rounded-md">{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'JD'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{personalInfo.name.toUpperCase() || 'SHARYA SINGH'}</h1>
            <p className="text-lg mt-1" style={{ color: 'var(--secondary-font-color)' }}>{title || experience[0]?.role || 'Professional'}</p>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-end gap-2"><Phone size={12} /><span>{personalInfo.phone}</span></div>
          <div className="flex items-center justify-end gap-2"><Mail size={12} /><span>{personalInfo.email}</span></div>
          <div className="flex items-center justify-end gap-2"><Globe size={12} /><span>{personalInfo.github}</span></div>
          <div className="flex items-center justify-end gap-2"><Globe size={12} /><span>{personalInfo.linkedin}</span></div>
        </div>
      </header>
      <hr style={{ borderColor: 'var(--accent-color)' }} />

      <main className="mt-6">
        <Section title="About Me">
          <p className="leading-relaxed">{summary}</p>
        </Section>

        <Section title="Education">
          <div className="space-y-4">
            {education.map(edu => (
              <div key={edu.id} className="flex">
                <div className="w-1/4">
                  <p className="font-semibold">{edu.startDate} - {edu.endDate}</p>
                  <p>{edu.institution}</p>
                </div>
                <div className="w-3/4 pl-4">
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className="mt-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet sem nec risus egestas accumsan.</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Experience">
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id} className="flex">
                <div className="w-1/4">
                  <p className="font-semibold">{exp.startDate} - {exp.endDate}</p>
                  <p>{exp.company}</p>
                </div>
                <div className="w-3/4 pl-4">
                  <h3 className="font-bold">{exp.role}</h3>
                  <p className="mt-1">{exp.description.split('\n')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Skills">
          <ul className="grid grid-cols-4 gap-x-8 gap-y-1 list-disc list-inside">
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
      </main>
    </div>
  );
};

export default MinimalistTemplate;