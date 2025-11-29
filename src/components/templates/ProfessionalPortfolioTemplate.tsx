import { ResumeData } from '@/types/resume';
import { Phone, Mail, MapPin, Linkedin, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CustomSectionRenderer from '@/components/CustomSectionRenderer';

interface TemplateProps {
    resumeData: ResumeData;
}

const ProfessionalPortfolioTemplate = ({ resumeData }: TemplateProps) => {
    const { personalInfo, summary, experience, education, skills, customSections, title } = resumeData;

    const Section = ({ title, children, accent = false }: { title: string, children: React.ReactNode, accent?: boolean }) => (
        <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <div className="mb-4">
                <h2
                    className="font-bold text-2xl tracking-tight mb-1"
                    style={{
                        color: accent ? 'var(--accent-color)' : 'var(--primary-font-color)',
                        textTransform: 'var(--section-header-style)' as any
                    }}
                >
                    {title}
                </h2>
                <div className="h-0.5 w-16 rounded" style={{ backgroundColor: 'var(--accent-color)' }}></div>
            </div>
            {children}
        </section>
    );

    return (
        <div
            className="w-[210mm] min-h-[297mm] shadow-lg font-[var(--font-family)] text-[length:var(--font-size-base)]"
            style={{ backgroundColor: 'var(--primary-background-color)', lineHeight: 'var(--line-height)' }}
        >
            {/* Header Section with Geometric Design */}
            <header
                className="relative p-12 pb-16"
                style={{
                    background: `linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-background-color) 100%)`,
                    color: 'var(--secondary-font-color)'
                }}
            >
                <div className="relative z-10">
                    <h1 className="text-5xl font-bold tracking-tight mb-3">
                        {personalInfo.name || 'Your Name'}
                    </h1>
                    <p className="text-xl opacity-90 mb-6">{title || experience[0]?.role || 'Professional'}</p>

                    {/* Contact Information */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {personalInfo.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                <span>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin size={16} />
                                <span>{personalInfo.linkedin}</span>
                            </div>
                        )}
                        {personalInfo.github && (
                            <div className="flex items-center gap-2">
                                <Github size={16} />
                                <span>{personalInfo.github}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative geometric shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                    <div className="absolute top-8 right-8 w-32 h-32 border-4 border-white rounded-full"></div>
                    <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded"></div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ padding: 'var(--page-margins)', color: 'var(--primary-font-color)' }}>
                {/* Professional Summary */}
                {summary && (
                    <Section title="Professional Summary" accent={true}>
                        <p className="leading-relaxed text-lg opacity-90">{summary}</p>
                    </Section>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="col-span-2">
                        {/* Experience */}
                        {experience.length > 0 && (
                            <Section title="Professional Experience">
                                <div className="space-y-6">
                                    {experience.map((exp) => (
                                        <div key={exp.id} className="relative pl-6 border-l-2" style={{ borderColor: 'var(--accent-color)' }}>
                                            <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                                            <div className="mb-2">
                                                <h3 className="text-xl font-bold" style={{ color: 'var(--accent-color)' }}>
                                                    {exp.role || 'Job Title'}
                                                </h3>
                                                <div className="flex justify-between items-baseline">
                                                    <p className="font-semibold text-lg opacity-90">
                                                        {exp.company || 'Company Name'}
                                                    </p>
                                                    <span className="text-sm opacity-70">
                                                        {exp.startDate} - {exp.endDate}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="leading-relaxed opacity-80 whitespace-pre-wrap">
                                                {exp.description.split('\n').map((line, i) =>
                                                    line.trim() && (
                                                        <p key={i} className="mb-1.5">• {line.replace(/^- /, '')}</p>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Custom Sections */}
                        {customSections?.filter(s => s.title).map(section => (
                            <Section key={section.id} title={section.title}>
                                <CustomSectionRenderer section={section} />
                            </Section>
                        ))}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="col-span-1">
                        {/* Education */}
                        {education.length > 0 && (
                            <Section title="Education">
                                <div className="space-y-4">
                                    {education.map((edu) => (
                                        <div key={edu.id} className="pb-4 border-b last:border-b-0" style={{ borderColor: 'var(--accent-color)', opacity: 0.2 }}>
                                            <h3 className="font-bold mb-1" style={{ color: 'var(--accent-color)' }}>
                                                {edu.degree || 'Degree'}
                                            </h3>
                                            <p className="text-sm font-medium opacity-90">
                                                {edu.institution || 'Institution'}
                                            </p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {edu.endDate || 'Year'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Skills */}
                        {skills.length > 0 && (
                            <Section title="Skills">
                                <div className="space-y-3">
                                    {skills.map((skill, index) => (
                                        <div key={index} className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: 'var(--accent-color)' }}
                                                ></div>
                                                <span className="text-sm font-medium">{skill}</span>
                                            </div>
                                            <div className="ml-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        backgroundColor: 'var(--accent-color)',
                                                        width: `${75 + (index % 4) * 5}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Additional Info Box */}
                        <div
                            className="p-4 rounded-lg mt-6"
                            style={{
                                backgroundColor: 'var(--secondary-background-color)',
                                color: 'var(--secondary-font-color)'
                            }}
                        >
                            <h3 className="font-bold mb-2 text-sm">PORTFOLIO HIGHLIGHTS</h3>
                            <p className="text-xs opacity-90 leading-relaxed">
                                Passionate about creating innovative solutions and delivering exceptional results.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-12 pb-6 pt-4 text-center text-xs opacity-60">
                <div className="h-px w-full mb-3" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.3 }}></div>
                <p>References available upon request</p>
            </footer>
        </div>
    );
};

export default ProfessionalPortfolioTemplate;
