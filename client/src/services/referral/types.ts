import { TokenTypeEnum } from '@/utils/tokenPrices';

export type GetClaimablePayload = {
  tokenType: TokenTypeEnum;
};

export type GetClaimableResponse = {
  tokenType: TokenTypeEnum;
  amount: number;
}[];
