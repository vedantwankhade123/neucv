import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { ResumeData } from '@/lib/resume-storage';
import { ResumePreview } from '@/components/ResumePreview';
import { cn } from '@/lib/utils';

interface ResumeCardHomeProps {
  resume: ResumeData;
  className?: string;
}

export const ResumeCardHome = ({ resume, className }: ResumeCardHomeProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={cn(
        "group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/50",
        "bg-muted/50",
        className
      )}
    >
      {/* Title and date outside the resume container */}
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold truncate">{resume.title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {new Date(resume.lastModified).toLocaleDateString()}
        </p>
      </CardHeader>

      {/* Resume preview container with overlay button */}
      <CardContent className="relative p-2 rounded-lg min-h-0 flex-1">
        <div onClick={() => navigate(`/editor/${resume.id}`)} className="cursor-pointer">
          <ResumePreview resume={resume} />
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
              navigate(`/editor/${resume.id}`);
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