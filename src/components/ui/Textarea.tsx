import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={5}
          className={cn(
            'w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors resize-none',
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

Textarea.displayName = 'Textarea';
export default Textarea;
