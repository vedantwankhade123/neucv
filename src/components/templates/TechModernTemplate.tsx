import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
    resumeData: ResumeData;
}

const TechModernTemplate = ({ resumeData }: TemplateProps) => {
    const { personalInfo, summary, experience, education, skills, customSections } = resumeData;

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                <h2
                    className="font-bold tracking-wide"
                    style={{
                        fontSize: 'var(--heading-font-size)',
                        textTransform: 'var(--section-header-style)' as any,
                        color: 'var(--accent-color)'
                    }}
                >
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );

    return (
        <div
            className="w-[210mm] min-h-[297mm] shadow-lg flex font-[var(--font-family)] text-[length:var(--font-size-base)]"
            style={{ backgroundColor: 'var(--primary-background-color)', lineHeight: 'var(--line-height)' }}
        >
            {/* Left Sidebar */}
            <aside
                className="w-[35%] p-8"
                style={{
                    backgroundColor: 'var(--secondary-background-color)',
                    color: 'var(--secondary-font-color)'
                }}
            >
                {/* Profile Photo */}
                <div className="flex justify-center mb-6">
                    <Avatar className="h-32 w-32 border-4" style={{ borderColor: 'var(--accent-color)' }}>
                        <AvatarImage src={personalInfo.photoUrl || '/placeholder.svg'} alt={personalInfo.name} />
                        <AvatarFallback style={{ backgroundColor: 'var(--accent-color)' }}>
                            {personalInfo.name ? personalInfo.name.slice(0, 2).toUpperCase() : 'TM'}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Personal Info */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-3 tracking-wide" style={{ color: 'var(--accent-color)' }}>
                        CONTACT
                    </h2>
                    <div className="space-y-2 text-sm">
                        {personalInfo.phone && (
                            <div className="flex items-start gap-2">
                                <Phone size={14} className="mt-1 flex-shrink-0" />
                                <span className="break-all">{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.email && (
                            <div className="flex items-start gap-2">
                                <Mail size={14} className="mt-1 flex-shrink-0" />
                                <span className="break-all">{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="mt-1 flex-shrink-0" />
                                <span>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div className="flex items-start gap-2">
                                <Linkedin size={14} className="mt-1 flex-shrink-0" />
                                <span className="break-all">{personalInfo.linkedin}</span>
                            </div>
                        )}
                        {personalInfo.github && (
                            <div className="flex items-start gap-2">
                                <Github size={14} className="mt-1 flex-shrink-0" />
                                <span className="break-all">{personalInfo.github}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-3 tracking-wide" style={{ color: 'var(--accent-color)' }}>
                        SKILLS
                    </h2>
                    <div className="space-y-2">
                        {skills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                                <span className="text-sm">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom Sections in Sidebar */}
                {customSections?.filter(s => s.title).slice(0, 1).map(section => (
                    <div key={section.id} className="mb-6">
                        <h2 className="text-lg font-bold mb-3 tracking-wide" style={{ color: 'var(--accent-color)' }}>
                            {section.title.toUpperCase()}
                        </h2>
                        <div className="text-sm">
                            <CustomSectionRenderer section={section} />
                        </div>
                    </div>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1" style={{ padding: 'var(--page-margins)', color: 'var(--primary-font-color)' }}>
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: 'var(--accent-color)' }}>
                        {personalInfo.name || 'Your Name'}
                    </h1>
                    <div className="h-1 w-20 rounded-full mb-4" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                    <p className="text-lg opacity-80">Software Engineer & Technology Enthusiast</p>
                </header>

                {/* Summary */}
                {summary && (
                    <Section title="About">
                        <p className="leading-relaxed text-justify">{summary}</p>
                    </Section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <Section title="Experience">
                        <div className="space-y-4">
                            {experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">{exp.role || 'Job Title'}</h3>
                                        <span className="text-sm opacity-70">
                                            {exp.startDate} - {exp.endDate}
                                        </span>
                                    </div>
                                    <p className="font-semibold mb-2" style={{ color: 'var(--accent-color)' }}>
                                        {exp.company || 'Company Name'}
                                    </p>
                                    <div className="leading-relaxed opacity-90 whitespace-pre-wrap">
                                        {exp.description.split('\n').map((line, i) =>
                                            line.trim() && (
                                                <p key={i} className="mb-1">• {line.replace(/^- /, '')}</p>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <Section title="Education">
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold">{edu.degree || 'Degree'}</h3>
                                        <span className="text-sm opacity-70">{edu.endDate || 'Year'}</span>
                                    </div>
                                    <p className="opacity-90">{edu.institution || 'Institution Name'}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Remaining Custom Sections */}
                {customSections?.filter(s => s.title).slice(1).map(section => (
                    <Section key={section.id} title={section.title}>
                        <CustomSectionRenderer section={section} />
                    </Section>
                ))}
            </main>
        </div>
    );
};

export default TechModernTemplate;
