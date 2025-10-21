export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  referralCode?: string;
};
