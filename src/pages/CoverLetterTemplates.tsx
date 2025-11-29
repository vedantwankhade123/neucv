import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from '@/components/UserNav';
import { CoverLetterPreview } from '@/components/CoverLetterPreview';
import CoverLetterPreviewModal from '@/components/CoverLetterPreviewModal';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveCoverLetterToFirestore } from '@/lib/firestore-cover-letter-service';
import { coverLetterTemplates } from '@/lib/coverletter-templates';
import { v4 as uuidv4 } from 'uuid';
import { CoverLetterData } from '@/types/coverletter';

const backgroundColors = [
    'bg-slate-50 dark:bg-slate-900/20',
    'bg-rose-50 dark:bg-rose-900/20',
    'bg-amber-50 dark:bg-amber-900/20',
    'bg-teal-50 dark:bg-teal-900/20',
    'bg-sky-50 dark:bg-sky-900/20',
    'bg-violet-50 dark:bg-violet-900/20'
];

const CoverLetterTemplates = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);
    const [user] = useAuthState(auth);

    const handleSelectTemplate = async (templateId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const newId = uuidv4();
        const newCoverLetter: CoverLetterData = {
            id: newId,
            userId: user.uid,
            title: 'Untitled Cover Letter',
            lastModified: Date.now(),
            templateId: templateId,
            recipient: {
                companyName: '',
                hiringManagerName: '',
                position: '',
                address: '',
            },
            sender: {
                name: user.displayName || '',
                email: user.email || '',
                phone: '',
                address: '',
            },
            content: {
                opening: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Position] role at [Company].',
                body: 'With my background and experience, I am confident I would be a valuable addition to your team.',
                closing: 'Thank you for considering my application.\n\nBest regards,',
            },
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };

        try {
            await saveCoverLetterToFirestore(user.uid, newCoverLetter);
            navigate(`/cover-letter/${templateId}/${newId}`);
        } catch (error) {
            console.error("Error creating cover letter:", error);
        }
    };

    const filteredTemplates = Object.entries(coverLetterTemplates).filter(([, template]) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sampleData: CoverLetterData = {
        id: 'sample',
        title: 'Sample',
        lastModified: Date.now(),
        recipient: {
            companyName: 'Acme Corp',
            hiringManagerName: 'Jane Smith',
            position: 'Senior Engineer',
            address: '123 Business Ave',
        },
        sender: {
            name: 'John Doe',
            email: 'john@email.com',
            phone: '+1 555-123-4567',
            address: '456 Main St',
        },
        content: {
            opening: 'Dear Ms. Smith,\n\nI am writing to express my interest in the Senior Engineer position.',
            body: 'With 5+ years of experience in software development, I am confident in my abilities.',
            closing: 'Thank you for your consideration.\n\nBest regards,',
        },
        templateId: 'classic',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-transparent p-4 hidden md:flex items-center justify-between flex-shrink-0 no-print h-16">
                <h1 className="text-2xl font-bold tracking-tight">Cover Letter Templates</h1>
                <UserNav />
            </header>
            <main className="flex-grow p-4 md:p-8 overflow-y-auto bg-muted/40">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose a Template to Get Started</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Select a design you like. You can always change styles and colors later in the editor.</p>
                    <div className="relative max-w-xl mx-auto mt-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 w-full rounded-full h-12 text-base shadow-md focus:shadow-inner transition-shadow duration-200"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map(([id, template], index) => {
                            return (
                                <div key={id} className="flex flex-col items-center group cursor-pointer" onClick={() => setPreviewingTemplateId(id)}>
                                    <div className={cn(
                                        "relative w-full aspect-[210/297] rounded-xl transition-all duration-300 group-hover:ring-2 group-hover:ring-primary ring-offset-4 shadow-sm group-hover:shadow-xl overflow-hidden",
                                        backgroundColors[index % backgroundColors.length]
                                    )}>
                                        <div className="absolute inset-4 flex items-center justify-center">
                                            <CoverLetterPreview
                                                data={{ ...sampleData, templateId: id }}
                                                className="h-full shadow-lg"
                                                showHoverEffect={false}
                                            />
                                        </div>

                                        {template.isPremium && (
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                                                Premium
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] rounded-xl">
                                            <div className="bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <Eye className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold mt-4 text-lg text-foreground/90 group-hover:text-primary transition-colors">{template.name}</h3>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-12">
                            <p className="text-lg">No templates found for "{searchQuery}".</p>
                            <p className="text-sm">Try searching for something else.</p>
                        </div>
                    )}
                </div>
            </main>
            <CoverLetterPreviewModal
                isOpen={!!previewingTemplateId}
                onClose={() => setPreviewingTemplateId(null)}
                templateId={previewingTemplateId}
                onSelectTemplate={handleSelectTemplate}
            />
        </div>
    );
};

export default CoverLetterTemplates;
