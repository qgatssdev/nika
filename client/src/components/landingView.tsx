'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { routes } from '@/routes';

const LandingView = () => {
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!headlineRef.current) return;

    const ctx = gsap.context(() => {
      const element = headlineRef.current!;
      const defaultText = 'DeFi your way.';
      const phrases = ['Hire me lol.', 'Engácheme.', 'Embauchez-moi.'];

      const loopTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0,
        paused: true,
      });

      const showText = (text: string) => {
        loopTl.to(element, {
          autoAlpha: 0,
          yPercent: 20,
          duration: 0.35,
          ease: 'power3.out',
        });
        loopTl.add(() => {
          element.textContent = text;
        });
        loopTl.to(element, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.45,
          ease: 'power3.out',
        });
        loopTl.to({}, { duration: 3 });
      };

      loopTl.to({}, { duration: 3 });
      phrases.forEach(showText);
      showText(defaultText);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(navRef.current, { autoAlpha: 0, y: -16, duration: 0.45 }, 0);
      tl.from(headlineRef.current, { autoAlpha: 0, y: 24, duration: 0.6 }, 0.1);
      tl.from(subheadRef.current, { autoAlpha: 0, y: 24, duration: 0.6 }, 0.18);
      tl.from(paraRef.current, { autoAlpha: 0, y: 20, duration: 0.55 }, 0.26);
      tl.from(ctasRef.current, { autoAlpha: 0, y: 20, duration: 0.55 }, 0.34);
      tl.from(
        imageRef.current,
        { autoAlpha: 0, y: 16, scale: 0.98, duration: 0.8 },
        0.18
      );
      tl.add(() => {
        loopTl.play();
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative min-h-screen overflow-hidden bg-[#05070E] text-white'
    >
      <div className='mx-auto max-w-[1160px] px-4 pt-6'>
        <div
          ref={navRef}
          className='backdrop-blur-sm/0 rounded-full border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between'
        >
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='https://cdn.prod.website-files.com/68beb00773e3235bb2303e4b/68c403bf183253cdc4c5aa3a_svg%20(18).svg'
              width={34}
              height={34}
              alt='Nika logo'
            />
            <div className='font-semibold'>Nika</div>
          </Link>
          <nav className='hidden md:flex items-center gap-6'>
            <Link
              href={routes.AUTH.SIGNUP}
              className='text-sm text-white/80 hover:text-white'
            >
              Sign Up
            </Link>
            <Link
              href={routes.AUTH.LOGIN}
              className='text-sm text-white/80 hover:text-white'
            >
              Login
            </Link>
          </nav>
          <button
            className='md:hidden rounded-full border border-white/10 p-2'
            aria-label='menu'
          >
            <div className='h-0.5 w-5 bg-white mb-1' />
            <div className='h-0.5 w-5 bg-white' />
          </button>
        </div>
      </div>

      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_600px_at_70%_20%,#1c2973_0%,transparent_60%)]' />

      <section className='relative'>
        <div className='mx-auto max-w-[1160px] px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-20'>
            <div className='z-10'>
              <div>
                <h1
                  ref={headlineRef}
                  className='text-[40px] sm:text-[52px] md:text-[64px] leading-[1.05] font-semibold'
                >
                  DeFi your way.
                </h1>
                <h2
                  ref={subheadRef}
                  className='text-[40px] sm:text-[52px] md:text-[64px] leading-[1.05] font-extrabold bg-linear-to-r from-[#6aa7ff] to-[#9b6bff] bg-clip-text text-transparent'
                >
                  Your Nika.
                </h2>
              </div>
              <p
                ref={paraRef}
                className='mt-6 text-[18px] sm:text-[20px] text-white/70 max-w-xl'
              >
                Spot, perps, staking, and yield across Ethereum, Solana,
                Arbitrum, and more. CEX-like speed, AI guidance, and total
                self-custody. All in one app.
              </p>
              <div ref={ctasRef} className='mt-8 flex gap-2'>
                <Link
                  href={routes.AUTH.SIGNUP}
                  className='inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition'
                >
                  <span>Sign Up</span>
                </Link>
                <Link
                  href={routes.AUTH.LOGIN}
                  className='inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#6aa7ff] to-[#9b6bff] text-white px-6 py-3 font-medium hover:bg-white/90 transition'
                >
                  <span>Login</span>
                </Link>
              </div>
            </div>
            <div ref={imageRef} className='relative'>
              <Image
                src='https://cdn.prod.website-files.com/68beb00773e3235bb2303e4b/68c27629ace7bb604a7341c5_Group%202147223929.png'
                alt='Nika mobile app and desktop trading dashboard showing portfolio balance, charts, and order book.'
                width={1140}
                height={700}
                className='w-full h-auto'
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
