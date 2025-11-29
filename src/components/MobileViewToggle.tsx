import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";

interface MobileViewToggleProps {
  view: 'form' | 'preview';
  setView: (view: 'form' | 'preview') => void;
}

export const MobileViewToggle = ({ view, setView }: MobileViewToggleProps) => {
  return (
    <div className="p-1 bg-muted rounded-full flex items-center w-full max-w-xs mx-auto">
      <Button
        variant={view === 'form' ? 'default' : 'ghost'}
        onClick={() => setView('form')}
        className="w-1/2 rounded-full flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Form
      </Button>
      <Button
        variant={view === 'preview' ? 'default' : 'ghost'}
        onClick={() => setView('preview')}
        className="w-1/2 rounded-full flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
    </div>
  );
};