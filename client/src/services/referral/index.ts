import apiHandler from '../api';
import ReferralRoute from './referral.route';
import { ClaimCommissionPayload } from '../trade/types';
import { GetClaimableResponse } from './types';

export const getClaimable = async (): Promise<GetClaimableResponse> => {
  const res = await apiHandler.get(ReferralRoute.claimable);
  return res.data as GetClaimableResponse;
};

export const claimCommission = async (payload: ClaimCommissionPayload) =>
  apiHandler.post(ReferralRoute.claim, payload);
