'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useUser } from '@/services/user/queries';
import { TbArrowsUpDown } from 'react-icons/tb';
import {
  TOKEN_USD_PRICE,
  TokenTypeEnum,
  getConversionRate,
} from '@/utils/tokenPrices';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePerformTrade } from '../mutations';
import toast from 'react-hot-toast';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import ClientOnly from '@/components/clientOnly';
import Storage from '@/utils/storage';
import Skeleton from '@/components/ui/skeleton';

const TradeWidget: React.FC = () => {
  const [payAmount, setPayAmount] = useState('0');
  const [getAmount, setGetAmount] = useState('0');

  const [payToken, setPayToken] = useState<TokenTypeEnum>(TokenTypeEnum.ETH);
  const [getToken, setGetToken] = useState<TokenTypeEnum>(TokenTypeEnum.SOL);

  const [isLoading, setIsLoading] = useState(false);
  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useUser();
  const { selectedToken: selectedWalletToken } = useSelectedWallet(
    user?.id,
    user?.wallets
  );

  const hasInitializedPayTokenRef = React.useRef(false);

  useEffect(() => {
    if (
      !hasInitializedPayTokenRef.current &&
      selectedWalletToken &&
      payToken !== selectedWalletToken
    ) {
      setPayToken(selectedWalletToken as TokenTypeEnum);
      hasInitializedPayTokenRef.current = true;
    }
  }, [selectedWalletToken, payToken]);

  const payBalance =
    user?.wallets?.find((w) => w.tokenType === payToken)?.balance ?? '0';
  const numericPayBalance = Number(payBalance);

  const volume = Number(payAmount) || 0;

  const conversionRate = getConversionRate(payToken, getToken);
  const grossGetAmount = volume * conversionRate;
  const isInsufficient = volume > numericPayBalance;

  const availableTokens = useMemo(() => {
    const fromUser = (user?.wallets ?? []).map(
      (w) => w.tokenType as TokenTypeEnum
    );

    const fallback = Object.keys(TOKEN_USD_PRICE) as TokenTypeEnum[];
    const list = fromUser.length ? fromUser : fallback;
    return Array.from(new Set(list));
  }, [user]);

  const getWalletBalance = useCallback(
    (symbol: TokenTypeEnum) => {
      const balanceStr = user?.wallets?.find(
        (w) => w.tokenType === symbol
      )?.balance;
      const balanceNum = Number(balanceStr ?? 0);
      return balanceNum;
    },
    [user]
  );

  const { mutate: performTrade, isPending: isPerformingTradeMutation } =
    usePerformTrade(
      () => {
        toast.success('Trade performed successfully');
        setIsLoading(false);
        setPayAmount('0');
        setGetAmount('0');

        if (user?.id) {
          Storage.setCookie(`selectedWallet_${user.id}`, getToken);
        }

        setPayToken(getToken);
      },
      (error) => {
        setIsLoading(false);
        toast.error(error.response?.data.message || 'An error occurred');
      }
    );

  const handleSwap = () => {
    const prevPay = payToken;
    setPayToken(getToken);
    setGetToken(prevPay);
    setPayAmount(getAmount);
    setGetAmount(payAmount);
  };

  const handleMockTrade = async () => {
    setIsLoading(true);
    if (volume <= 0) return;
    if (numericPayBalance < volume) return;

    performTrade({
      userId: user?.id ?? '',
      volume,
      fees: user?.feeTier ? user.feeTier * volume : 0,
      payTokenType: payToken,
      getTokenType: getToken,
    });
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
                  type='number'
                />
              </div>
              {isUserLoading || isUserFetching ? (
                <div className='absolute -bottom-5 w-24'>
                  <Skeleton className='h-3 w-full rounded-sm' />
                </div>
              ) : (
                <div className='text-xs text-white/50 mt-1 absolute -bottom-5'>
                  $
                  {(
                    Number(payAmount) *
                    getConversionRate(payToken, TokenTypeEnum.USDC)
                  ).toFixed(2)}
                </div>
              )}
            </div>
            <div className='relative'>
              <ClientOnly
                fallback={
                  <button
                    className='px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm'
                    disabled
                  >
                    {payToken}
                  </button>
                }
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm'>
                      {payToken}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {availableTokens.map((t) => (
                      <DropdownMenuItem key={t} onClick={() => setPayToken(t)}>
                        <div className='flex items-center gap-2 justify-between w-full'>
                          <span>{t}</span>
                          <span className='text-xs text-white/70'>
                            {getWalletBalance(t).toFixed(8)}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ClientOnly>
              {isUserLoading || isUserFetching ? (
                <div className='absolute -bottom-6 right-0 w-36'>
                  <Skeleton className='h-3 w-full rounded-sm' />
                </div>
              ) : (
                <div className='text-xs text-white/60 mt-1 text-right absolute -bottom-6 whitespace-nowrap -left-25'>
                  Balance: {Number(payBalance).toFixed(8)} {payToken}
                </div>
              )}
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
              {isUserLoading || isUserFetching ? (
                <Skeleton className='h-7 w-40 rounded-md' />
              ) : (
                <div className='text-2xl font-semibold'>
                  ${grossGetAmount.toFixed(8)}
                </div>
              )}
            </div>
            <div>
              <ClientOnly
                fallback={
                  <button
                    className='px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm'
                    disabled
                  >
                    {getToken}
                  </button>
                }
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm'>
                      {getToken}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {availableTokens.map((t) => (
                      <DropdownMenuItem key={t} onClick={() => setGetToken(t)}>
                        <div className='flex items-center gap-2 justify-between w-full'>
                          <span>{t}</span>
                          <span className='text-xs text-white/70'>
                            {getWalletBalance(t).toFixed(8)}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2 text-xs text-white/70'>
          <div className='rounded-lg bg-white/5 border border-white/10 p-2'>
            <div>Fees</div>
            {isUserLoading || isUserFetching ? (
              <Skeleton className='h-4 w-16 mt-1 rounded-sm' />
            ) : (
              <div className='text-white mt-1'>
                ${user?.feeTier ? user.feeTier * Number(payAmount) : 0}
              </div>
            )}
          </div>
          <div className='rounded-lg bg-white/5 border border-white/10 p-2'>
            <div>Slippage</div>
            <div className='text-white mt-1'>1%</div>
          </div>
        </div>

        {isInsufficient ? (
          <div className='text-red-400 text-sm mb-2'>Insufficient balance</div>
        ) : null}

        {payToken === getToken && !isInsufficient ? (
          <div className='text-red-400 text-sm mb-2'>
            You cannot trade the same token
          </div>
        ) : null}

        <Button
          onClick={handleMockTrade}
          loading={isLoading || isPerformingTradeMutation}
          disabled={
            payToken === getToken ||
            isInsufficient ||
            Number(payAmount) <= 0 ||
            isNaN(Number(payAmount)) ||
            isNaN(Number(getAmount))
          }
        >
          Trade
        </Button>
      </div>
    </div>
  );
};

export default TradeWidget;
