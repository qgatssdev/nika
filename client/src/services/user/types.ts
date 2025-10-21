import { TokenTypeEnum } from '@/utils/tokenPrices';

export type CustomCommissionStructure = {
  isKOL: boolean;
  directCommission: number;
  levelCommissions: Record<string, number>;
  waivedFees: boolean;
};

export type Commission = {
  id: string;
  userId: string;
  sourceUserId: string;
  level: number;
  amount: number;
  tokenType: string;
  isClaimed: boolean;
};

export type Claim = {
  id: string;
  userId: string;
  tokenType: string;
  amount: number;
  claimedAt: Date;
};

export type UserWallet = {
  id: string;
  tokenType: TokenTypeEnum;
  balance: number;
  claimedAmount: number;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  wallets: UserWallet[];
  referralCode: string;
  feeTier: number;
  cashbackPercent: number;
  customCommissionStructure: CustomCommissionStructure;
  commissionsEarned: Commission[];
  claims: Claim[];
};
