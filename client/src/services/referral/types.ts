import { TokenSymbol } from '@/utils/tokenPrices';

export type GetClaimablePayload = {
  tokenType: TokenSymbol;
};

export type GetClaimableResponse = {
  tokenType: TokenSymbol;
  amount: number;
}[];
