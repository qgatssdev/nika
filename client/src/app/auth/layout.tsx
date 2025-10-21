'use client';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/routes';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#05070E] text-white'>
      <div className='relative hidden md:block'>
        <div className='absolute inset-0 bg-[radial-gradient(800px_500px_at_60%_30%,#1c2973_0%,transparent_60%)]' />
        <div className='relative h-full flex items-center justify-center p-10'>
          <div className='max-w-md'>
            <Image
              src='https://cdn.prod.website-files.com/68beb00773e3235bb2303e4b/68c27629ace7bb604a7341c5_Group%202147223929.png'
              alt='Preview'
              width={900}
              height={600}
              className='w-full h-auto'
              priority
            />
          </div>
        </div>
      </div>
      <div className='relative flex items-center justify-center px-6 py-10'>
        <div className='absolute top-6 left-6'>
          <Link href={routes.HOME} className='flex items-center gap-2'>
            <Image
              src='https://cdn.prod.website-files.com/68beb00773e3235bb2303e4b/68c403bf183253cdc4c5aa3a_svg%20(18).svg'
              width={28}
              height={28}
              alt='Nika logo'
            />
            <span className='font-semibold'>Nika</span>
          </Link>
        </div>
        <div className='w-full max-w-md'>{children}</div>
      </div>
    </div>
  );
}
