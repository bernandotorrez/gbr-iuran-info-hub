
import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, icon, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label 
            htmlFor={props.id} 
            className={cn(error && "text-destructive")}
          >
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 h-4 w-4 text-gray-400">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              icon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";
