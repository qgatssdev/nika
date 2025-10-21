'use client';

import * as React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

const baseButtonClass =
  'w-full rounded-full bg-white text-black py-2.5 font-medium hover:bg-white/90 disabled:opacity-50 inline-flex items-center justify-center';

const Spinner = () => (
  <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black' />
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[baseButtonClass, className ?? ''].join(' ').trim()}
        {...props}
      >
        {loading ? <Spinner /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
