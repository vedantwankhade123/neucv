import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  fitToScreen: () => void;
  className?: string;
}

const ZoomControls = ({ zoom, setZoom, fitToScreen, className }: ZoomControlsProps) => {
  const zoomIn = () => setZoom(zoom + 0.1);
  const zoomOut = () => setZoom(Math.max(0.1, zoom - 0.1));

  return (
    <div
      className={cn(
        "bg-background p-2 rounded-full shadow-md flex items-center gap-2 no-print",
        className
      )}
    >
      <Button variant="ghost" size="icon" onClick={zoomOut} aria-label="Zoom out">
        <ZoomOut className="h-5 w-5" />
      </Button>
      <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
      <Button variant="ghost" size="icon" onClick={zoomIn} aria-label="Zoom in">
        <ZoomIn className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={fitToScreen} aria-label="Fit to screen">
        <Minimize className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ZoomControls;