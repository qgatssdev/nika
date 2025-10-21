export enum TokenTypeEnum {
  USDC = 'USDC',
  ETH = 'ETH',
  SOL = 'SOL',
  BTC = 'BTC',
}

export const TOKEN_USD_PRICE: Record<TokenTypeEnum, number> = {
  USDC: 1,
  ETH: 2700,
  SOL: 150,
  BTC: 60000,
};

export function getConversionRate(
  payToken: TokenTypeEnum,
  getToken: TokenTypeEnum
): number {
  const payUsd = TOKEN_USD_PRICE[payToken] ?? 1;
  const getUsd = TOKEN_USD_PRICE[getToken] ?? 1;
  return payUsd / getUsd;
}
