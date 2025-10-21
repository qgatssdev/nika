import apiHandler from '../api';
import UserRoute from './user.route';
import { User } from './types';

export const getUser = async (): Promise<User> => {
  const res = await apiHandler.get(UserRoute.user);
  return res.data as User;
};
