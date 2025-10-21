'use client';

import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isLoading?: boolean;
  prefixIcon?: React.ReactNode;
};

const baseInputClass =
  'w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isLoading, prefixIcon, type = 'text', ...props }, ref) => {
    return (
      <div className='relative w-full'>
        {prefixIcon ? (
          <div className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center'>
            {prefixIcon}
          </div>
        ) : null}
        <input
          type={type}
          className={[
            baseInputClass,
            prefixIcon ? 'pl-10' : '',
            isLoading ? 'pr-10' : '',
            className ?? '',
          ]
            .join(' ')
            .trim()}
          ref={ref}
          {...props}
        />
        {isLoading ? (
          <div className='absolute right-[10px] top-1/2 -translate-y-1/2'>
            {/* Loading indicator slot; replace with app spinner if available */}
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
          </div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
