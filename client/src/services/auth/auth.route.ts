import { baseUrl } from "../index.route";

const AuthRoute = {
  signUp: `${baseUrl}/auth/signup`,
  login: `${baseUrl}/auth/login`,
  verifyOtp: `${baseUrl}/auth/verify-otp`,
  resendOtp: `${baseUrl}/auth/resend-otp`,
  forgotPassword: `${baseUrl}/auth/forgot-password`,
  resetPassword: `${baseUrl}/auth/reset-password`,
  googleAuth: `${baseUrl}/auth/google`,
};

export default AuthRoute;
