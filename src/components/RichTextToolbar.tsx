import React from 'react';
import { Bold, List } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface RichTextToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (newValue: string) => void;
}

export const RichTextToolbar = ({ textareaRef, onChange }: RichTextToolbarProps) => {
  const applyFormatting = (format: 'bold' | 'bullet') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    let newValue;

    if (format === 'bold') {
      const selectedText = value.substring(start, end);
      if (selectedText) {
        newValue = `${value.substring(0, start)}**${selectedText}**${value.substring(end)}`;
      }
    } else if (format === 'bullet') {
      let lineStart = start;
      while (lineStart > 0 && value[lineStart - 1] !== '\n') {
        lineStart--;
      }

      let lineEnd = end;
      if (end > lineStart && value[end - 1] === '\n') {
        lineEnd = end - 1;
      }
      while (lineEnd < value.length && value[lineEnd] !== '\n') {
        lineEnd++;
      }

      const selectedLinesText = value.substring(lineStart, lineEnd);
      const lines = selectedLinesText.split('\n');
      const bulletedLines = lines.map(line => line.trim() ? (line.trim().startsWith('- ') ? line.replace(/^- /, '') : `- ${line}`) : line).join('\n');

      newValue = `${value.substring(0, lineStart)}${bulletedLines}${value.substring(lineEnd)}`;
    }

    if (newValue !== undefined) {
      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        if (format === 'bold') {
          textarea.setSelectionRange(start + 2, end + 2);
        } else {
          textarea.setSelectionRange(start, end + (newValue.length - value.length));
        }
      }, 0);
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-input/50 mb-2 shadow-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bold</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('bullet')}>
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bullet List</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};