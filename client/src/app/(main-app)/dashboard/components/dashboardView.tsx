'use client';
import React from 'react';
import TradeWidget from './tradeWidget';
import { useUser } from '@/services/user/queries';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardView = () => {
  const { data: user, isLoading } = useUser();
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm'>
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
                    {w.tokenType}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className='text-sm text-white/80'>
              {user?.wallets?.find((w) => w.tokenType === selectedToken)
                ? `${
                    user.wallets.find((w) => w.tokenType === selectedToken)!
                      .balance
                  } ${selectedToken}`
                : ''}
            </div>
          </div>
        </div>
      </div>
      <TradeWidget />
    </div>
  );
};

export default DashboardView;
