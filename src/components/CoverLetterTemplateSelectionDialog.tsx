import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { coverLetterTemplates } from '@/lib/coverletter-templates';
import { CoverLetterPreview } from '@/components/CoverLetterPreview';
import type { CoverLetterData } from '@/types/coverletter';
import { v4 as uuidv4 } from 'uuid';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveCoverLetterToFirestore } from '@/lib/firestore-cover-letter-service';

interface CoverLetterTemplateSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CoverLetterTemplateSelectionDialog({ open, onOpenChange }: CoverLetterTemplateSelectionDialogProps) {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    const handleSelectTemplate = async (templateId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Create new cover letter
        const newId = uuidv4();
        const newCoverLetter: CoverLetterData = {
            id: newId,
            userId: user.uid,
            title: 'Untitled Cover Letter',
            lastModified: Date.now(),
            templateId: templateId,
            recipient: {
                companyName: 'Acme Corporation',
                hiringManagerName: 'Jane Smith',
                position: 'Senior Software Engineer',
                address: '123 Business Ave, Tech City, TC 12345',
            },
            sender: {
                name: user.displayName || 'John Doe',
                email: user.email || 'john.doe@email.com',
                phone: '+1 (555) 123-4567',
                address: '456 Main St, Hometown, HT 67890',
            },
            content: {
                opening: 'Dear Ms. Smith,\n\nI am writing to express my strong interest in the Senior Software Engineer position at Acme Corporation.',
                body: 'With over 5 years of experience in full-stack development and a passion for creating innovative solutions, I am confident in my ability to contribute to your team.\n\nMy expertise includes React, Node.js, and cloud technologies, which align perfectly with your requirements.',
                closing: 'Thank you for considering my application. I look forward to discussing how my skills can benefit Acme Corporation.\n\nBest regards,',
            },
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        };

        try {
            await saveCoverLetterToFirestore(user.uid, newCoverLetter);
            navigate(`/cover-letter/${templateId}/${newId}`);
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating cover letter:", error);
        }
    };

    // Sample data for preview
    const sampleData: CoverLetterData = {
        id: 'sample',
        title: 'Sample Cover Letter',
        lastModified: Date.now(),
        recipient: {
            companyName: 'Acme Corporation',
            hiringManagerName: 'Jane Smith',
            position: 'Senior Software Engineer',
            address: '123 Business Ave, Tech City, TC 12345',
        },
        sender: {
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 (555) 123-4567',
            address: '456 Main St, Hometown, HT 67890',
        },
        content: {
            opening: 'Dear Ms. Smith,\n\nI am writing to express my strong interest in the Senior Software Engineer position at Acme Corporation.',
            body: 'With over 5 years of experience in full-stack development and a passion for creating innovative solutions, I am confident in my ability to contribute to your team.\n\nMy expertise includes React, Node.js, and cloud technologies, which align perfectly with your requirements.',
            closing: 'Thank you for considering my application. I look forward to discussing how my skills can benefit Acme Corporation.\n\nBest regards,',
        },
        templateId: 'classic',
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold">Select a Cover Letter Template</DialogTitle>
                    <DialogDescription>
                        Choose a template that best matches your style and the position you're applying for
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto p-6 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(coverLetterTemplates).map(([id, template]) => {
                            return (
                                <Card
                                    key={id}
                                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                    onClick={() => handleSelectTemplate(id)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center justify-between">
                                            {template.name}
                                            {template.isPremium && (
                                                <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full">
                                                    Premium
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{template.category}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-[210/297] rounded-lg overflow-hidden relative mb-4 border bg-white shadow-sm group-hover:shadow-md transition-shadow">
                                            <CoverLetterPreview
                                                data={{ ...sampleData, templateId: id }}
                                                className="w-full h-full"
                                                showHoverEffect={false}
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button size="sm" variant="secondary" className="shadow-lg">
                                                    Use Template
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
