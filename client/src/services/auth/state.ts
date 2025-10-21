import { StorageKeys } from "@/lib/constants";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type UseAuthDetails = {
  email: string;
  phone: string;
  signupPhone: string;
  otp: string;
};

const sessionJSONStorage = createJSONStorage<UseAuthDetails>(
  () => sessionStorage
);

export const useUserAuthDetailsAtom = atomWithStorage<UseAuthDetails>(
  StorageKeys.USE_AUTH_DETAILS,
  {
    email: "",
    phone: "",
    signupPhone: "",
    otp: "",
  },
  sessionJSONStorage
);
