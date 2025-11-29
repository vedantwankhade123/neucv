import { resumeTemplates } from '@/lib/resume-templates';
import React from 'react';
import { cn } from '@/lib/utils';
import { previewDataMap } from '@/data/previewData';
import { TemplatePreview } from './TemplatePreview';

const backgroundColors = [
  'bg-slate-50 dark:bg-slate-900/20',
  'bg-rose-50 dark:bg-rose-900/20',
  'bg-amber-50 dark:bg-amber-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
  'bg-sky-50 dark:bg-sky-900/20',
  'bg-violet-50 dark:bg-violet-900/20'
];

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {

  return (
    <div className="p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(resumeTemplates).map(([id, template], index) => {
          const TemplateComponent = template.component;
          const previewData = previewDataMap[id];
          if (!previewData) return null;
          return (
            <div key={id} className="flex flex-col items-center group cursor-pointer" onClick={() => onSelectTemplate(id)}>
              <div className={cn(
                "rounded-lg p-2 w-full h-auto aspect-[4/5] flex items-center justify-center transition-all duration-200 group-hover:ring-2 group-hover:ring-primary ring-offset-2 shadow-sm border",
                backgroundColors[index % backgroundColors.length]
              )}>
                <div className="aspect-[210/297] w-full shadow-lg pointer-events-none flex justify-center items-start overflow-hidden rounded-sm">
                  <TemplatePreview
                    resume={previewData}
                    className="h-full w-full"
                    showHoverEffect={false}
                  />
                </div>
              </div>
              <h3 className="font-semibold mt-2 text-sm text-foreground/80">{template.name}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;