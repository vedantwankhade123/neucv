import { ResumeData } from '@/types/resume';
import { Badge } from '@/components/ui/badge';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ClassicTemplate = ({ resumeData }: ResumePreviewProps) => {
  const { personalInfo, summary, experience, education, skills, customSections, layout } = resumeData;

  // Helper to get header class based on style
  const getHeaderClass = () => {
    // This would ideally come from a context or prop if not in CSS vars, but we can assume CSS vars for now or just default
    // Since we don't have the style object here directly, we might rely on CSS classes or variables.
    // However, the prompt implies we should make it editable.
    // The styles are applied to the container in PreviewModal/ResumePreviewContainer.
    // Let's assume we can use a CSS variable --section-header-style
    return "font-bold mb-2";
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section style={{ marginBottom: 'var(--section-spacing)' }}>
      <h2
        className={`font-bold mb-2 tracking-widest`}
        style={{
          color: 'var(--primary-font-color)',
          fontSize: 'var(--heading-font-size)',
          textTransform: 'var(--section-header-style)' as any
        }}
      >
        {title}
      </h2>
      <div className="h-[1.5px] bg-[var(--accent-color)] w-full mb-4"></div>
      {children}
    </section>
  );

  return (
    <div
      className="shadow-lg w-[210mm] min-h-[297mm] text-[length:var(--font-size-base)]"
      style={{
        padding: 'var(--page-margins)',
        backgroundColor: 'var(--primary-background-color)',
        color: 'var(--primary-font-color)',
        fontFamily: 'var(--font-family)',
        lineHeight: 'var(--line-height)'
      }}
    >
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--accent-color)] tracking-tight">{personalInfo.name || 'Jane Doe'}</h1>
        <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs opacity-90" style={{ color: 'var(--primary-font-color)' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>&middot; {personalInfo.phone}</span>}
          {personalInfo.address && <span>&middot; {personalInfo.address}</span>}
          {personalInfo.linkedin && <span>&middot; {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>&middot; {personalInfo.github}</span>}
        </div>
      </header>
      <main>
        {layout.map(section => {
          if (!section.enabled) return null;
          switch (section.id) {
            case 'summary':
              return (
                <Section key="summary" title="Professional Summary">
                  <p className="leading-relaxed">{summary}</p>
                </Section>
              );
            case 'experience':
              return (
                <Section key="experience" title="Work Experience">
                  {experience.map((exp) => (
                    <div key={exp.id} className="mb-4">
                      <div className="flex justify-between items-baseline"><h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)' }}>{exp.role || 'Job Title'}</h3></div>
                      <p className="font-medium opacity-90" style={{ color: 'var(--primary-font-color)' }}>{exp.company || 'Company Name'} &mdash; {exp.startDate || 'Start'} - {exp.endDate || 'End'}</p>
                      <ul className="mt-1 list-disc list-inside whitespace-pre-wrap leading-relaxed opacity-90" style={{ color: 'var(--primary-font-color)' }}>{exp.description.split('\n').map((line, i) => line.trim() && <li key={i} className="pl-2">{line.replace(/^- /, '')}</li>)}</ul>
                    </div>
                  ))}
                </Section>
              );
            case 'education':
              return (
                <Section key="education" title="Education">
                  {education.map((edu) => (
                    <div key={edu.id} className="mb-2">
                      <div className="flex justify-between items-baseline"><h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)' }}>{edu.degree || 'Degree'}</h3></div>
                      <p className="font-medium opacity-90" style={{ color: 'var(--primary-font-color)' }}>{edu.institution || 'Institution Name'} &mdash; {edu.endDate || 'End Date'}</p>
                    </div>
                  ))}
                </Section>
              );
            case 'skills':
              return (
                <Section key="skills" title="Skills">
                  <div className="flex flex-wrap gap-2">{skills.filter(skill => skill).map((skill, index) => (<Badge key={index} style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-background-color)' }} className="hover:opacity-90 rounded-sm">{skill}</Badge>))}</div>
                </Section>
              );
            case 'customSections':
              return customSections?.map(customSection => (
                customSection.title && (
                  <Section key={customSection.id} title={customSection.title}>
                    {(customSection.organization || (customSection.startDate && customSection.endDate)) && (
                      <div className="font-medium opacity-90 mb-2" style={{ color: 'var(--primary-font-color)' }}>
                        {customSection.organization}
                        {customSection.organization && (customSection.startDate || customSection.endDate) ? ' — ' : ''}
                        {customSection.startDate || customSection.endDate ? `${customSection.startDate || ''} - ${customSection.endDate || ''}` : ''}
                      </div>
                    )}
                    <CustomSectionRenderer section={customSection} />
                  </Section>
                )
              ));
            default:
              return null;
          }
        })}
      </main>
    </div>
  );
};

export default ClassicTemplate;