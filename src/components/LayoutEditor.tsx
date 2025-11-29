import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';
import { LayoutItem } from '@/types/resume';

interface LayoutEditorProps {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  onToggleSection: (id: string) => void;
}

const LayoutEditor = ({ layout, onLayoutChange, onToggleSection }: LayoutEditorProps) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onLayoutChange(items);
  };

  if (!isBrowser) {
    return null;
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Drag to reorder sections or use the toggle to hide them.
      </p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {layout.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "flex items-center justify-between p-3 bg-card rounded-lg border transition-shadow",
                        snapshot.isDragging && "bg-muted shadow-lg"
                      )}
                    >
                      <div className="flex items-center">
                        <div {...provided.dragHandleProps} className="cursor-grab mr-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {section.enabled ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={() => onToggleSection(section.id)}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default LayoutEditor;