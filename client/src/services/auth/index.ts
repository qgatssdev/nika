import { SignInPayload, SignUpPayload } from './types';
import apiHandler from '../api';
import AuthRoute from './auth.route';

export const signUp = async (payload: SignUpPayload) =>
  apiHandler.post(AuthRoute.signUp, payload);

export const login = async (payload: SignInPayload) =>
  apiHandler.post(AuthRoute.login, payload);
