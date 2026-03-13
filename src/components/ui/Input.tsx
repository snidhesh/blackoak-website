import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors',
            'focus:outline-none focus:border-black focus:ring-0',
            'placeholder:text-gray-400',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
