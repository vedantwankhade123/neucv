import { ResumeData } from '@/types/resume';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, User, Briefcase, GraduationCap, Folder, Target } from 'lucide-react';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
  resumeData: ResumeData;
}

const DesignerTemplate = ({ resumeData }: TemplateProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

  const SkillBar = ({ level }: { level: string }) => (
    <div className="w-full bg-[var(--secondary-font-color)]/30 rounded-full h-1.5">
      <div className="h-1.5 rounded-full" style={{ width: level, backgroundColor: 'var(--accent-color)' }}></div>
    </div>
  );

  const skillLevels = ['90%', '80%', '75%'];

  return (
    <div className="w-[210mm] min-h-[297mm] font-[var(--font-family)] text-[length:var(--font-size-base)] flex shadow-lg" style={{ lineHeight: 'var(--line-height)' }}>
      {/* Sidebar */}
      <aside className="w-[35%] relative" style={{ backgroundColor: 'var(--secondary-background-color)', color: 'var(--secondary-font-color)' }}>
        <div className="absolute top-0 left-0 w-full h-40" style={{ backgroundColor: 'var(--accent-color)' }}></div>
        <div className="relative z-10 p-8 flex flex-col items-center text-center">
          <Avatar className="h-32 w-32 border-4 mt-12" style={{ borderColor: 'var(--accent-color)' }}>
            <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
            <AvatarFallback>{personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'NL'}</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold mt-4">{personalInfo.name || 'Nina Lane'}</h1>
          <p className="opacity-80">{title || experience[0]?.role || 'Professional'}</p>

          <div className="w-full text-left mt-8">
            <div className="flex items-center gap-3 mb-3">
              <Phone size={18} className="text-[var(--accent-color)]" />
              <h2 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)' }}>Contact</h2>
            </div>
            <hr className="border-white/20 mb-3" />
            <div className="space-y-2">
              <p className="font-semibold">Email</p>
              <p className="opacity-80">{personalInfo.email}</p>
              <p className="font-semibold mt-2">Phone</p>
              <p className="opacity-80">{personalInfo.phone}</p>
              <p className="font-semibold mt-2">Website</p>
              <p className="opacity-80">{personalInfo.github}</p>
              <p className="font-semibold mt-2">LinkedIn</p>
              <p className="opacity-80">{personalInfo.linkedin}</p>
            </div>
          </div>

          <div className="w-full text-left mt-6">
            <div className="flex items-center gap-3 mb-3">
              <Target size={18} className="text-[var(--accent-color)]" />
              <h2 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)' }}>Skills</h2>
            </div>
            <hr className="border-white/20 mb-3" />
            <div className="space-y-3">
              {skills.slice(0, 3).map((skill, i) => (
                <div key={i}>
                  <p className="mb-1">{skill}</p>
                  <SkillBar level={skillLevels[i % skillLevels.length]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-[65%]" style={{ padding: 'var(--page-margins)', backgroundColor: 'var(--primary-background-color)', color: 'var(--primary-font-color)' }}>
        <section style={{ marginBottom: 'var(--section-spacing)' }}>
          <div className="flex items-center gap-3 mb-2">
            <User size={20} className="text-[var(--accent-color)]" />
            <h2 className="font-bold" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Profile</h2>
          </div>
          <hr className="mb-3" />
          <p className="leading-relaxed">{summary}</p>
        </section>

        <section style={{ marginBottom: 'var(--section-spacing)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={20} className="text-[var(--accent-color)]" />
            <h2 className="font-bold" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Experience</h2>
          </div>
          <hr className="mb-4" />
          <div className="relative">
            <div className="absolute left-2 top-1 w-0.5 h-full bg-[var(--accent-color)]/20"></div>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--primary-background-color)' }}></div>
                  <h3 className="font-semibold">{exp.role}</h3>
                  <p className="font-medium mb-1" style={{ color: 'var(--secondary-font-color)' }}>{exp.company} | {exp.startDate} - {exp.endDate}</p>
                  <p>{exp.description.split('\n')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--section-spacing)' }}>
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap size={20} className="text-[var(--accent-color)]" />
            <h2 className="font-bold" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>Education</h2>
          </div>
          <hr className="mb-3" />
          {education.map(edu => (
            <div key={edu.id}>
              <h3 className="font-semibold">{edu.degree}</h3>
              <p className="font-medium" style={{ color: 'var(--secondary-font-color)' }}>{edu.institution}</p>
              <p style={{ color: 'var(--secondary-font-color)' }}>Graduated: {edu.endDate}</p>
            </div>
          ))}
        </section>

        {customSections?.map(section => (
          section.title && (
            <section key={section.id} style={{ marginBottom: 'var(--section-spacing)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Folder size={20} className="text-[var(--accent-color)]" />
                <h2 className="font-bold" style={{ fontSize: 'var(--heading-font-size)', textTransform: 'var(--section-header-style)' as any }}>{section.title}</h2>
              </div>
              <hr className="mb-3" />
              <CustomSectionRenderer section={section} />
            </section>
          )
        ))}
      </main>
    </div>
  );
};

export default DesignerTemplate;