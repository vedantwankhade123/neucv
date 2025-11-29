export interface CoverLetterData {
    id: string;
    userId?: string;
    title: string;
    linkedResumeId?: string;
    lastModified: number;
    recipient: {
        companyName: string;
        hiringManagerName?: string;
        position: string;
        address?: string;
    };
    sender: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    content: {
        opening: string;
        body: string;
        closing: string;
    };
    templateId: string;
    date: string;
}

export interface CoverLetterTemplate {
    id: string;
    name: string;
    component: React.ComponentType<{ data: CoverLetterData }>;
    category: 'Professional' | 'Modern' | 'Creative';
    isPremium: boolean;
}
