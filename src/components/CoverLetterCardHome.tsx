import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Mail } from 'lucide-react';
import { CoverLetterData } from '@/types/coverletter';
import { CoverLetterPreview } from '@/components/CoverLetterPreview';
import { cn } from '@/lib/utils';

interface CoverLetterCardHomeProps {
    coverLetter: CoverLetterData;
    className?: string;
}

export const CoverLetterCardHome = ({ coverLetter, className }: CoverLetterCardHomeProps) => {
    const navigate = useNavigate();

    return (
        <Card
            className={cn(
                "group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/50",
                "bg-muted/50",
                className
            )}
        >
            {/* Title and date outside the container */}
            <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded-md">
                        <Mail className="w-3 h-3 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold truncate flex-1">{coverLetter.title || 'Untitled Cover Letter'}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                    {new Date(coverLetter.lastModified).toLocaleDateString()}
                </p>
            </CardHeader>

            {/* Preview container with overlay button */}
            <CardContent className="relative p-2 rounded-lg min-h-0 flex-1">
                <div onClick={() => navigate(`/cover-letter/${coverLetter.templateId}/${coverLetter.id}`)} className="cursor-pointer h-full overflow-hidden rounded bg-white shadow-sm border">
                    {/* Scale down the preview significantly for the card */}
                    <div className="transform scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none">
                        <CoverLetterPreview data={coverLetter} />
                    </div>
                </div>

                {/* Gradient overlay for better button visibility - always visible */}
                <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-0">
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-background/98 via-background/85 to-transparent" />
                </div>

                {/* Edit button - always visible with enhanced styling */}
                <div className="absolute bottom-2 left-2 right-2 z-10">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cover-letter/${coverLetter.templateId}/${coverLetter.id}`);
                        }}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm h-9 border-0 rounded-full"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
