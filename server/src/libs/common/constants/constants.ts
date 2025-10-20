export interface FeeBreakdown {
  totalFee: number;
  cashback: number;
  treasury: number;
  commissions: {
    level1?: { userId: string; percent: number; amount: number };
    level2?: { userId: string; percent: number; amount: number };
    level3?: { userId: string; percent: number; amount: number };
  };
}

export const CREATED_AT_COLUMN = 'createdAt';

export enum TokenTypeEnum {
  USDT = 'USDT',
  ETH = 'ETH',
  SOL = 'SOL',
  BTC = 'BTC',
}
