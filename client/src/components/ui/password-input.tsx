'use client';

import * as React from 'react';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isLoading?: boolean;
};

const baseInputClass =
  'w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30';

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, isLoading, ...props }, ref) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className='relative w-full'>
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={[
          baseInputClass,
          'pr-10',
          isLoading ? 'pr-14' : '',
          className ?? '',
        ]
          .join(' ')
          .trim()}
        ref={ref}
      />
      <button
        type='button'
        onClick={() => setShow((s) => !s)}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/80 hover:text-white focus:outline-none cursor-pointer'
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
