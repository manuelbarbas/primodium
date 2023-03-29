import { useAccount as useWagmiAccount } from "wagmi";

export function useAccount() {
  const { address } = useWagmiAccount();

  return { address };
}
