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
