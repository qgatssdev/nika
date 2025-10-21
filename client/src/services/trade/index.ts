import apiHandler from '../api';
import { baseUrl } from '../index.route';

export type TradeWebhookPayload = {
  userId: string;
  volume: number;
  fees: number;
  tokenType: string; // server enum TokenTypeEnum
};

export const TradeRoutes = {
  webhook: `${baseUrl}/trade/webhook`,
};

export const postTradeWebhook = async (payload: TradeWebhookPayload) =>
  apiHandler.post(TradeRoutes.webhook, payload);
