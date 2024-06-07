import { AccountClientContext } from "@/hooks/providers/AccountClientProvider";
import { useContext } from "react";

export const useAccountClient = () => {
  const context = useContext(AccountClientContext);
  if (!context) {
    throw new Error("useAccountClientContext must be used within an AccountProvider");
  }
  return context;
};
