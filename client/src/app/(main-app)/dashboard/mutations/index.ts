import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FnCallback } from '@/services/types';
import {
  ClaimCommissionPayload,
  TradeWebhookPayload,
} from '@/services/trade/types';
import { claimCommission, performTrade } from '@/services/trade';

export const usePerformTrade = (
  onSuccess: FnCallback,
  onError?: FnCallback
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TradeWebhookPayload) => {
      const { data } = await performTrade(payload);
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useClaimCommission = (
  onSuccess: FnCallback,
  onError?: FnCallback
) => {
  return useMutation({
    mutationFn: async (payload: ClaimCommissionPayload) => {
      const { data } = await claimCommission(payload);
      return data;
    },
    onSuccess,
    onError,
  });
};
