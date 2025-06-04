
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface ValidatedSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  containerClassName?: string;
  disabled?: boolean;
}

export const ValidatedSelect = React.forwardRef<HTMLButtonElement, ValidatedSelectProps>(
  ({ label, error, placeholder, value, onValueChange, options, containerClassName, disabled }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger 
            ref={ref}
            className={cn(
              error && "border-destructive focus:ring-destructive"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedSelect.displayName = "ValidatedSelect";
