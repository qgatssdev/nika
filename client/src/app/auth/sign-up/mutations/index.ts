import { useMutation } from '@tanstack/react-query';
import { FnCallback } from '@/services/types';
import { signUp } from '@/services/auth';
import { SignUpPayload } from '@/services/auth/types';

export const useSignUp = (onSuccess: FnCallback, onError?: FnCallback) => {
  return useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      const { data } = await signUp(payload);
      return data;
    },
    onSuccess,
    onError,
  });
};
