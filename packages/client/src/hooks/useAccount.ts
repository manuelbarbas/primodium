import { useAccount as useWagmiAccount } from "wagmi";
import { useMud } from "../context/MudContext";

export function useAccount() {
  const { address } = useWagmiAccount();
  const { defaultWalletAddress } = useMud();

  if (!defaultWalletAddress) {
    return { address };
  } else {
    return { address: defaultWalletAddress };
  }
}
