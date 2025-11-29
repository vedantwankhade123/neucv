import { ResumeData } from '@/types/resume';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Mail, Phone } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const GreenfieldTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, experience, education, skills, customSections } = resumeData;

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      <header className="flex justify-between items-start" style={{ marginBottom: 'var(--section-spacing)' }}>
        <div>
          <h1 className="text-5xl font-bold">{personalInfo.name.split(' ')[0]}</h1>
          <h1 className="text-5xl font-bold text-[var(--accent-color)]">{personalInfo.name.split(' ').slice(1).join(' ')}</h1>
        </div>
        <Avatar className="h-24 w-24">
          <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
          <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'EW'}</AvatarFallback>
        </Avatar>
      </header>

      <main className="grid grid-cols-3 gap-8">
        {/* Left Column (Work Experience) */}
        <div className="col-span-2">
          <h2 className="font-bold uppercase tracking-widest text-[var(--accent-color)] mb-4" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Work Experience</h2>
          <div className="relative">
            <div className="absolute left-2 top-2 w-0.5 h-full bg-[var(--accent-color)]/30"></div>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-8">
                  <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-4" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--primary-background-color)' }}></div>
                  <h3 className="font-bold">{exp.role}</h3>
                  <p className="font-semibold" style={{ color: 'var(--secondary-font-color)' }}>{exp.company}</p>
                  <p className="mb-2" style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                  <p className="mb-2" style={{ color: 'var(--secondary-font-color)' }}>{exp.description.split('\n')[0]}</p>
                  <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--secondary-font-color)' }}>
                    {exp.description.split('\n').slice(1).map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="col-span-1">
          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold uppercase tracking-widest text-[var(--accent-color)] mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Sales Executive</h2>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><Linkedin size={12} className="text-[var(--accent-color)]" /><span>{personalInfo.linkedin}</span></div>
              <div className="flex items-center gap-2"><Mail size={12} className="text-[var(--accent-color)]" /><span>{personalInfo.email}</span></div>
              <div className="flex items-center gap-2"><Phone size={12} className="text-[var(--accent-color)]" /><span>{personalInfo.phone}</span></div>
            </div>
          </section>

          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold uppercase tracking-widest text-[var(--accent-color)] mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Relevant Skills</h2>
            <ul className="list-disc list-inside space-y-1">
              {skills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold uppercase tracking-widest text-[var(--accent-color)] mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Education History</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className="font-semibold text-[var(--accent-color)]">{edu.institution}</p>
                  <p style={{ color: 'var(--secondary-font-color)' }}>{edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>

          {customSections?.map(section => (
            section.title && (
              <section key={section.id} style={{ marginBottom: 'var(--section-spacing)' }}>
                <h2 className="font-bold uppercase tracking-widest text-[var(--accent-color)] mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{section.title}</h2>
                <CustomSectionRenderer section={section} />
              </section>
            )
          ))}
        </div>
      </main>
    </div>
  );
};

export default GreenfieldTemplate;