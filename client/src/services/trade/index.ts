import apiHandler from '../api';
import { ClaimCommissionPayload, TradeWebhookPayload } from './types';
import TradeRoute from './trade.route';

export const performTrade = async (payload: TradeWebhookPayload) =>
  apiHandler.post(TradeRoute.webhook, payload);

export const claimCommission = async (payload: ClaimCommissionPayload) =>
  apiHandler.post(TradeRoute.claim, payload);
