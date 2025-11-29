import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ id, name, label, value, onChange, type = "text", icon: Icon, className, ...props }, ref) => {
    return (
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          ref={ref}
          placeholder=" "
          value={value}
          onChange={onChange}
          className={`peer block w-full appearance-none rounded-xl border border-input bg-background/50 px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 shadow-sm transition-all duration-200 hover:border-primary/50 focus:shadow-md h-12 ${Icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
        <Label
          htmlFor={id}
          className={`absolute top-3 z-10 origin-[0] -translate-y-5 scale-75 transform text-sm text-muted-foreground duration-200 
                     peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
                     peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-primary
                     bg-background px-1 pointer-events-none
                     ${Icon ? 'left-10 peer-focus:left-3 peer-placeholder-shown:left-10' : 'left-3 peer-focus:left-3'}`}
        >
          {label}
        </Label>
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";