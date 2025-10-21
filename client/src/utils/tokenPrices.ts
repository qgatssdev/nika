export type TokenSymbol = 'USDC' | 'ETH' | 'SOL' | 'BTC';

export const TOKEN_USD_PRICE: Record<TokenSymbol, number> = {
  USDC: 1,
  ETH: 2700,
  SOL: 150,
  BTC: 60000,
};

export function getConversionRate(
  payToken: TokenSymbol,
  getToken: TokenSymbol
): number {
  const payUsd = TOKEN_USD_PRICE[payToken] ?? 1;
  const getUsd = TOKEN_USD_PRICE[getToken] ?? 1;
  return payUsd / getUsd;
}
