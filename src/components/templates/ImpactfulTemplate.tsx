import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const ImpactfulTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2 className="font-bold tracking-widest" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{title}</h2>
      <hr className="my-2" style={{ borderColor: 'var(--accent-color)', opacity: 0.3 }} />
      {children}
    </section>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ backgroundColor: 'var(--primary-background-color)', lineHeight: 'var(--line-height)' }}>
      <header className="p-8 flex items-center gap-6" style={{ backgroundColor: 'var(--secondary-background-color)', color: 'var(--secondary-font-color)' }}>
        <Avatar className="h-28 w-28 border-4 border-white">
          <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
          <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'SA'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{personalInfo.name.toUpperCase() || 'SATRIA ANUGRAH'}</h1>
          <p className="opacity-80 mt-1">{title || experience[0]?.role || 'Professional'}</p>
          <div className="flex items-center gap-4 mt-2 opacity-80">
            <span><Phone size={12} className="inline mr-1" />{personalInfo.phone}</span>
            <span><Mail size={12} className="inline mr-1" />{personalInfo.email}</span>
            <span><MapPin size={12} className="inline mr-1" />{personalInfo.address}</span>
            {personalInfo.linkedin && <span><MapPin size={12} className="inline mr-1" />{personalInfo.linkedin}</span>}
          </div>
        </div>
      </header>
      <hr />

      <main style={{ padding: 'var(--page-margins)', color: 'var(--primary-font-color)' }}>
        <Section title="About Me">
          <p className="leading-relaxed">{summary}</p>
        </Section>

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-3">
            <Section title="Education">
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <p className="font-semibold" style={{ color: 'var(--secondary-font-color)' }}>{edu.startDate} - {edu.endDate}</p>
                    <h3 className="font-bold">{edu.institution} | {edu.degree}</h3>
                    <p className="mt-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet sem nec risus egestas accumsan.</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Work Experience">
              <div className="space-y-4">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <p className="font-semibold" style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                    <h3 className="font-bold">{exp.company} | {exp.role}</h3>
                    <p className="mt-1">{exp.description.split('\n')[0]}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
          <div className="col-span-2">
            <Section title="Skills">
              <ul className="space-y-2 list-disc list-inside">
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
        </div>
      </main>
    </div>
  );
};

export default ImpactfulTemplate;