import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import React from 'react';

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const FloatingLabelTextarea = React.forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
  ({ id, name, label, value, onChange, rows = 4, className, ...props }, ref) => {
    return (
      <div className="relative group">
        <Textarea
          id={id}
          name={name}
          ref={ref}
          placeholder=" "
          value={value}
          onChange={onChange}
          rows={rows}
          className={`peer block w-full appearance-none rounded-xl border border-input bg-background/50 px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 shadow-sm transition-all duration-200 hover:border-primary/50 focus:shadow-md resize-y min-h-[100px] ${className}`}
          {...props}
        />
        <Label
          htmlFor={id}
          className="absolute top-3 left-3 z-10 origin-[0] -translate-y-5 scale-75 transform text-sm text-muted-foreground duration-200 
                     peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
                     peer-focus:left-3 peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-primary
                     bg-background px-1 pointer-events-none"
        >
          {label}
        </Label>
      </div>
    );
  }
);
FloatingLabelTextarea.displayName = "FloatingLabelTextarea";