import { TokenSymbol } from '@/utils/tokenPrices';

export type TradeWebhookPayload = {
  userId: string;
  volume: number;
  fees?: number;
  payTokenType: TokenSymbol;
  getTokenType: TokenSymbol;
};

export type ClaimCommissionPayload = {
  tokenType: TokenSymbol;
};
