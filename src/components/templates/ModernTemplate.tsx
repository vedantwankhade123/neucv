import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const ModernTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const SkillBar = ({ skill, level }: { skill: string, level: number }) => (
    <div className="mb-2">
      <p className="font-medium">{skill}</p>
      <div className="w-full bg-[var(--primary-font-color)]/20 rounded-full h-1.5 mt-1">
        <div className="h-1.5 rounded-full" style={{ width: `${level}%`, backgroundColor: 'var(--accent-color)' }}></div>
      </div>
    </div>
  );

  const skillLevels = [90, 85, 80, 95, 75, 88];

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] flex shadow-lg" style={{ lineHeight: 'var(--line-height)' }}>
      {/* Sidebar */}
      <aside className="w-[35%]" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--secondary-background-color)', color: 'var(--secondary-font-color)' }}>
        <div className="pt-36"> {/* Padding top to make space for the overlapping avatar */}
          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold tracking-widest mb-2" style={{ color: 'var(--secondary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>About Me</h2>
            <hr className="w-10" style={{ borderColor: 'var(--accent-color)' }} />
            <p className="leading-relaxed mt-3">{summary}</p>
          </section>

          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold tracking-widest mb-2" style={{ color: 'var(--secondary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Education</h2>
            <hr className="w-10" style={{ borderColor: 'var(--accent-color)' }} />
            <div className="mt-3 space-y-3">
              {education.map(edu => (
                <div key={edu.id}>
                  <p className="font-bold">{edu.degree}</p>
                  <p>{edu.institution}</p>
                  <p className="opacity-80">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold tracking-widest mb-2" style={{ color: 'var(--secondary-font-color)', fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Skills</h2>
            <hr className="w-10" style={{ borderColor: 'var(--accent-color)' }} />
            <div className="mt-3">
              {skills.map((skill, i) => (
                <SkillBar key={i} skill={skill} level={skillLevels[i % skillLevels.length]} />
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-[65%] relative" style={{ backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)' }}>
        <div className="absolute left-[-60px] top-10 z-10">
          <Avatar className="h-32 w-32 border-8 border-[var(--primary-background-color)] rounded-full">
            <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
            <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'JD'}</AvatarFallback>
          </Avatar>
        </div>

        <header className="h-48 flex flex-col justify-center items-start pl-24" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-background-color)' }}>
          <h1 className="text-4xl font-bold tracking-wider">{personalInfo.name.toUpperCase() || 'LORNA ALVARADO'}</h1>
          <p className="tracking-widest mt-1">{title || experience[0]?.role || 'Professional'}</p>
        </header>

        <div style={{ padding: 'var(--page-margins)' }}>
          <section className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 border-b pb-6">
            <div className="flex items-center gap-2"><Phone size={12} /><span>{personalInfo.phone}</span></div>
            <div className="flex items-center gap-2"><Globe size={12} /><span>{personalInfo.github}</span></div>
            <div className="flex items-center gap-2"><Mail size={12} /><span>{personalInfo.email}</span></div>
            <div className="flex items-center gap-2"><MapPin size={12} /><span>{personalInfo.address}</span></div>
            <div className="flex items-center gap-2"><Globe size={12} /><span>{personalInfo.linkedin}</span></div>
          </section>

          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <h2 className="font-bold tracking-widest mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Experience</h2>
            <hr className="w-10" style={{ borderColor: 'var(--accent-color)' }} />
            <div className="relative mt-4">
              <div className="absolute left-2 top-1 w-0.5 h-full bg-[var(--accent-color)]/20"></div>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--primary-background-color)' }}></div>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold">{exp.role}</h3>
                      <p style={{ color: 'var(--secondary-font-color)' }}>{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <p className="font-medium mb-1" style={{ color: 'var(--secondary-font-color)' }}>{exp.company}</p>
                    <ul className="list-disc list-inside whitespace-pre-wrap">
                      {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {customSections?.map(section => (
            section.title && (
              <section key={section.id} style={{ marginBottom: 'var(--section-spacing)' }}>
                <h2 className="font-bold tracking-widest mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{section.title}</h2>
                <hr className="w-10" style={{ borderColor: 'var(--accent-color)' }} />
                <div className="mt-4">
                  <CustomSectionRenderer section={section} />
                </div>
              </section>
            )
          ))}
        </div>
      </main>
    </div>
  );
};

export default ModernTemplate;