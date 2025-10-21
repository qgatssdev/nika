'use client';

import React from 'react';
import Storage from '@/utils/storage';

type WalletLike = { id: string; tokenType: string };

export function useSelectedWallet(userId?: string, wallets?: WalletLike[]) {
  const [selectedToken, setSelectedToken] = React.useState<string>('');

  React.useEffect(() => {
    if (!userId || !wallets || wallets.length === 0) return;

    const key = `selectedWallet_${userId}`;
    const fromCookie = Storage.getCookie(key);

    const hasFromCookie =
      !!fromCookie && wallets.some((w) => w.tokenType === fromCookie);
    const initial = hasFromCookie
      ? (fromCookie as string)
      : wallets[0].tokenType;

    const tokenToUse = selectedToken || initial;

    if (tokenToUse !== selectedToken) {
      setSelectedToken(tokenToUse);
    }

    Storage.setCookie(key, tokenToUse);
  }, [userId, wallets, selectedToken]);

  const selectedWallet = React.useMemo(
    () => wallets?.find((w) => w.tokenType === selectedToken),
    [wallets, selectedToken]
  );

  return { selectedToken, setSelectedToken, selectedWallet };
}

export default useSelectedWallet;
