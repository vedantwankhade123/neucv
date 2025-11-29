import { ResumeData } from '@/types/resume';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const ATSFriendlyTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] shadow-lg flex gap-8" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)', lineHeight: 'var(--line-height)' }}>
      {/* Left Sidebar */}
      <aside className="w-1/3">
        <Avatar className="h-28 w-28" style={{ marginBottom: 'var(--section-spacing)' }}>
          <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
          <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'DS'}</AvatarFallback>
        </Avatar>

        <section style={{ marginBottom: 'var(--section-spacing)' }}>
          <h2 className="font-bold tracking-wider border-b pb-1 mb-2" style={{ fontSize: 'var(--heading-font-size)', borderColor: 'var(--accent-color)', textTransform: 'var(--section-header-style)' as any }}>LINKS</h2>
          <div className="space-y-1">
            {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="block text-[var(--secondary-font-color)] hover:text-[var(--accent-color)]">{personalInfo.linkedin}</a>}
            {personalInfo.github && <a href={personalInfo.github} target="_blank" rel="noreferrer" className="block text-[var(--secondary-font-color)] hover:text-[var(--accent-color)]">{personalInfo.github}</a>}
          </div>
        </section>

        {customSections?.map(section => (
          section.title && (
            <section key={section.id} style={{ marginBottom: 'var(--section-spacing)' }}>
              <h2 className="font-bold tracking-wider border-b pb-1 mb-2" style={{ fontSize: 'var(--heading-font-size)', borderColor: 'var(--accent-color)', textTransform: 'var(--section-header-style)' as any }}>{section.title}</h2>
              <CustomSectionRenderer section={section} />
            </section>
          )
        ))}
      </aside>

      {/* Main Content */}
      <main className="w-2/3">
        <header style={{ marginBottom: 'var(--section-spacing)' }}>
          <h1 className="text-5xl font-extrabold uppercase">{personalInfo.name.toUpperCase()}</h1>
          <p className="font-medium tracking-widest mt-1" style={{ color: 'var(--secondary-font-color)' }}>{title || experience[0]?.role || 'Professional'}</p>
          <div className="space-y-1 mt-4 text-right">
            <div className="flex items-center justify-end gap-2"><p>{personalInfo.address}</p><MapPin size={12} /></div>
            <div className="flex items-center justify-end gap-2"><p>{personalInfo.phone}</p><Phone size={12} /></div>
            <div className="flex items-center justify-end gap-2"><p>{personalInfo.email}</p><Mail size={12} /></div>
          </div>
        </header>

        <div className="flex items-start gap-4" style={{ marginBottom: 'var(--section-spacing)' }}>
          <div className="w-4 h-4 rounded-full mt-1" style={{ backgroundColor: 'var(--accent-color)' }}></div>
          <p className="flex-1"><span className="font-bold" style={{ textTransform: 'var(--section-header-style)' as any }}>ABOUT ME</span> &mdash; {summary}</p>
        </div>

        <h2 className="font-bold tracking-wider mb-4" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>WORK EXPERIENCE</h2>
        <div className="relative pl-6" style={{ marginBottom: 'var(--section-spacing)' }}>
          <div className="absolute left-2 top-1 w-0.5 h-full" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.3 }}></div>
          {experience.map(exp => (
            <div key={exp.id} className="relative mb-4">
              <div className="absolute -left-4 top-1 w-4 h-4 rounded-full border-2" style={{ backgroundColor: 'var(--primary-background-color)', borderColor: 'var(--accent-color)' }}></div>
              <h3 className="font-bold">{exp.role} | {exp.startDate} - {exp.endDate}</h3>
              <p className="font-semibold" style={{ color: 'var(--secondary-font-color)' }}>{exp.company}</p>
              <ul className="list-disc list-inside mt-1">
                {exp.description.split('\n').map((line, i) => <li key={i}>{line.replace(/^- /, '')}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="font-bold tracking-wider mb-4" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>EDUCATION</h2>
        <div className="relative pl-6" style={{ marginBottom: 'var(--section-spacing)' }}>
          <div className="absolute left-2 top-1 w-0.5 h-full" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.3 }}></div>
          {education.map(edu => (
            <div key={edu.id} className="relative mb-4">
              <div className="absolute -left-4 top-1 w-4 h-4 rounded-full border-2" style={{ backgroundColor: 'var(--primary-background-color)', borderColor: 'var(--accent-color)' }}></div>
              <h3 className="font-bold">{edu.degree} | {edu.endDate}</h3>
              <p className="font-semibold" style={{ color: 'var(--secondary-font-color)' }}>{edu.institution}</p>
            </div>
          ))}
        </div>

        <h2 className="font-bold tracking-wider mb-2" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>SKILLS</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <div key={i} className="font-semibold border-b-2 pb-1 px-2" style={{ borderColor: 'var(--accent-color)' }}>{skill}</div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ATSFriendlyTemplate;