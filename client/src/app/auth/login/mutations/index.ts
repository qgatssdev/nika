import { useMutation } from '@tanstack/react-query';
import { FnCallback } from '@/services/types';
import { login } from '@/services/auth';
import { SignInPayload } from '@/services/auth/types';

export const useLogin = (onSuccess: FnCallback, onError?: FnCallback) => {
  return useMutation({
    mutationFn: async (payload: SignInPayload) => {
      const { data } = await login(payload);
      return data;
    },
    onSuccess,
    onError,
  });
};
