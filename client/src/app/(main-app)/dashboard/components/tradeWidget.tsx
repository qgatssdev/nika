'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { postTradeWebhook, TradeWebhookPayload } from '@/services/trade';
import { TbArrowsUpDown } from 'react-icons/tb';

const TradeWidget: React.FC = () => {
  const [payAmount, setPayAmount] = useState('2.53');
  const [getAmount, setGetAmount] = useState('6845.55');
  const [payToken, setPayToken] = useState<'ETH' | 'USDT' | 'USDC'>('ETH');
  const [getToken, setGetToken] = useState<'USDC' | 'ETH'>('USDC');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = () => {
    setPayToken((prev) => (prev === 'ETH' ? 'USDC' : 'ETH'));
    setGetToken((prev) => (prev === 'USDC' ? 'ETH' : 'USDC'));
    setPayAmount(getAmount);
    setGetAmount(payAmount);
  };

  const handleMockTrade = async () => {
    setIsLoading(true);
    try {
      const payload: TradeWebhookPayload = {
        userId: '00000000-0000-0000-0000-000000000000',
        volume: Number(payAmount) * 2700,
        fees: 3.2,
        tokenType: getToken,
      };
      await postTradeWebhook(payload);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto rounded-2xl bg-black/40 border border-white/10 p-4 text-white'>
      <div className='flex items-center justify-between mb-3'>
        <span className='text-sm text-white/80'>Trade</span>
        <div className='flex items-center gap-2 text-white/50'>
          <span className='text-xs'>🔍</span>
          <span className='text-xs'>⚙️</span>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='rounded-xl bg-white/5 border border-white/10 p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-white/70'>You pay</span>
          </div>
          <div className='flex items-center gap-2 pb-4'>
            <div className='flex flex-col w-full relative'>
              <div className='flex-1'>
                <Input
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder='0.0'
                />
              </div>
              <div className='text-xs text-white/50 mt-1 absolute -bottom-5'>
                $6865.88
              </div>
            </div>
            <div>
              <button className='px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm'>
                {payToken}
              </button>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center'>
          <button
            onClick={handleSwap}
            className='h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center'
            aria-label='Swap tokens'
          >
            <TbArrowsUpDown className='w-4 h-4' />
          </button>
        </div>

        <div className='rounded-xl bg-white/5 border border-white/10 p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-white/70'>You Get</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex-1'>
              <div className='text-2xl font-semibold'>${getAmount}</div>
            </div>
            <div>
              <button className='px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm'>
                {getToken}
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2 text-xs text-white/70'>
          <div className='rounded-lg bg-white/5 border border-white/10 p-2'>
            <div>Min. Received</div>
            <div className='text-white mt-1'>${getAmount}</div>
          </div>
          <div className='rounded-lg bg-white/5 border border-white/10 p-2'>
            <div>Fees</div>
            <div className='text-white mt-1'>$3.2</div>
          </div>
          <div className='rounded-lg bg-white/5 border border-white/10 p-2'>
            <div>Slippage</div>
            <div className='text-white mt-1'>1%</div>
          </div>
        </div>

        <Button onClick={handleMockTrade} loading={isLoading}>
          Trade
        </Button>
      </div>
    </div>
  );
};

export default TradeWidget;
