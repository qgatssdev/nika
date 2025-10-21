'use client';
import React, { useState } from 'react';
import TradeWidget from './tradeWidget';
import { useUser } from '@/services/user/queries';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Storage from '@/utils/storage';
import { useRouter } from 'next/navigation';
import ClaimModal from './claimModal';
import ClientOnly from '@/components/clientOnly';
import Input from '@/components/ui/input';
import toast from 'react-hot-toast';
import { routes } from '@/routes';
import { TbCopy } from 'react-icons/tb';

const DashboardView = () => {
  const { data: user, isLoading } = useUser();
  const { refresh } = useRouter();

  const clientUrl = process.env.CLIENT_URL;
  const referralUrl = `${clientUrl}${routes.AUTH.SIGNUP}${
    user?.referralCode ? `?ref=${user?.referralCode}` : ''
  }`;

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const { selectedToken, setSelectedToken } = useSelectedWallet(
    user?.id,
    user?.wallets
  );

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <div className='text-xl font-semibold'>Dashboard</div>
        <div className='flex items-center gap-3'>
          <div className='text-sm text-white/80'>
            {isLoading
              ? 'Loading…'
              : `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
                user?.email}
          </div>
          <div className='flex items-center gap-2'>
            <ClientOnly
              fallback={
                <button
                  className='px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm cursor-default'
                  disabled
                >
                  {selectedToken || 'Select Wallet'}
                </button>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm cursor-pointer'>
                    {selectedToken || 'Select Wallet'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {(user?.wallets ?? []).map((w) => (
                    <DropdownMenuItem
                      key={w.id}
                      onClick={() => setSelectedToken(w.tokenType)}
                      className={
                        w.tokenType === selectedToken ? 'bg-white/10' : ''
                      }
                    >
                      <div className='flex items-center gap-2 justify-between w-full'>
                        <span>{w.tokenType}</span>
                        <span className='text-xs text-white/70'>
                          {w.balance}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </ClientOnly>
            <div className='text-sm text-white/80'>
              {user?.wallets?.find((w) => w.tokenType === selectedToken)
                ? `${
                    user.wallets.find((w) => w.tokenType === selectedToken)!
                      .balance
                  } ${selectedToken}`
                : ''}
            </div>
            <button
              onClick={() => setIsClaimOpen(true)}
              className='ml-5 px-3 py-1.5 rounded-md bg-white text-black border border-white/10 text-sm cursor-pointer'
            >
              Claim Commissions
            </button>
            <button
              onClick={() => {
                Storage.removeCookie('authSession');
                refresh();
              }}
              type='button'
              className='cursor-pointer ml-10 px-3 py-1.5 rounded-md bg-[#B3261E] border border-white/10 text-sm'
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {isClaimOpen ? (
        <ClaimModal onClose={() => setIsClaimOpen(false)} />
      ) : null}

      <ClientOnly
        fallback={
          <div className='w-full max-w-md mx-auto mb-4'>
            <div className='text-sm text-white/70 mb-1'>Invite link</div>
            <div className='rounded-md bg-white/5 border border-white/10 h-10' />
          </div>
        }
      >
        <div className='w-full max-w-md mx-auto mb-4 mt-[100px]'>
          <div className='text-sm text-white/70 mb-1'>Invite link</div>
          <div className='flex items-center gap-2'>
            <div className='flex-1 relative'>
              <Input readOnly value={referralUrl} className='w-full' />
              <button
                className='absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 bg-white text-black items-center px-2 py-1 rounded-md text-sm'
                onClick={() => {
                  const url = referralUrl;
                  navigator.clipboard.writeText(url);
                  toast.success('Copied');
                }}
              >
                <TbCopy className='w-4 h-4' />
                Copy
              </button>
            </div>
          </div>
        </div>
      </ClientOnly>

      <div className='mt-[10px]'>
        <TradeWidget />
      </div>
    </div>
  );
};

export default DashboardView;
