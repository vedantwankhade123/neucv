import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const CreateNewResumeCard = () => {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "group flex flex-col items-center justify-center h-full border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
      )}
      onClick={() => navigate('/templates')}
    >
      <CardContent className="flex flex-col items-center justify-center text-center p-4">
        <PlusCircle className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        <p className="mt-4 text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
          Create New
        </p>
      </CardContent>
    </Card>
  );
};