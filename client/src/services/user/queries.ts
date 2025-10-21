import { useQuery } from '@tanstack/react-query';
import { getUser } from '.';

export const useUser = () => {
  const queryKey = ['user'];

  return useQuery({
    queryKey,
    queryFn: getUser,
  });
};
