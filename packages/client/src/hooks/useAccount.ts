import { useAccount as useWagmiAccount } from "wagmi";

export default function useAccount() {
  const { address } = useWagmiAccount();

  return { address };
}
