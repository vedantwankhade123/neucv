import React, { useRef } from 'react';
import { RichTextToolbar } from './RichTextToolbar';
import { FloatingLabelTextarea } from './ui/floating-label-textarea';

interface FormRichTextareaProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export const FormRichTextarea = ({ id, name, label, value, onChange, rows = 4 }: FormRichTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToolbarChange = (newValue: string) => {
    const event = {
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  return (
    <div>
      <RichTextToolbar textareaRef={textareaRef} onChange={handleToolbarChange} />
      <FloatingLabelTextarea
        id={id}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        rows={rows}
        ref={textareaRef}
      />
    </div>
  );
};