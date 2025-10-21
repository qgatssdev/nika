'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useClaimCommission } from '../mutations';
import { TokenSymbol } from '@/utils/tokenPrices';
import { useGetClaimable } from '../queries';

type ClaimModalProps = {
  onClose: () => void;
};

const ClaimModal: React.FC<ClaimModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [loadingToken, setLoadingToken] = useState<TokenSymbol | null>(null);
  const { data: claimable, isLoading, isRefetching } = useGetClaimable();

  const { mutate: claimCommission } = useClaimCommission(
    () => {
      toast.success('Commission claimed');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['getClaimable'] });
    },
    (error) => {
      toast.error(error.response?.data.message || 'Failed to claim commission');
    }
  );

  const handleClaim = (tokenType: TokenSymbol) => {
    if (loadingToken) return;
    setLoadingToken(tokenType);
    claimCommission(
      { tokenType },
      {
        onSettled: () => setLoadingToken(null),
      }
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/60' onClick={onClose} />
      <div className='relative z-10 w-full max-w-md rounded-xl bg-black border border-white/10 p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='text-white/90 font-medium'>Claim commissions</div>
          <button onClick={onClose} className='text-white/60 hover:text-white'>
            ✕
          </button>
        </div>
        <div className='space-y-2 max-h-64 overflow-auto'>
          {isLoading || isRefetching ? (
            <div className='text-white/70 text-sm'>Loading...</div>
          ) : (claimable ?? []).length === 0 ? (
            <div className='text-white/70 text-sm'>
              No claimable commissions.
            </div>
          ) : (
            (claimable ?? [])?.map((w) => (
              <div
                key={w.tokenType}
                className='flex items-center justify-between rounded-md bg-white/5 border border-white/10 p-2'
              >
                <div className='text-white/90'>{w.tokenType}</div>
                <div className='text-white/70 text-sm'>
                  Unclaimed: {w.amount}
                </div>
                <button
                  onClick={() => handleClaim(w.tokenType)}
                  disabled={loadingToken === w.tokenType}
                  className='px-3 py-1.5 rounded-md bg-white text-black text-sm disabled:opacity-60'
                >
                  {loadingToken === w.tokenType ? 'Claiming…' : 'Claim'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimModal;
