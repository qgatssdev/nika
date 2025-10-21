import { useQuery } from '@tanstack/react-query';
import { getClaimable } from '@/services/referral';

export const useGetClaimable = () => {
  const queryKey = ['getClaimable'];

  return useQuery({
    queryKey,
    queryFn: getClaimable,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  });
};
