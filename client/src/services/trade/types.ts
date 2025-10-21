import { TokenTypeEnum } from '@/utils/tokenPrices';

export type TradeWebhookPayload = {
  userId: string;
  volume: number;
  fees?: number;
  payTokenType: TokenTypeEnum;
  getTokenType: TokenTypeEnum;
};

export type ClaimCommissionPayload = {
  tokenType: TokenTypeEnum;
};
