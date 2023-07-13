import { useAccount as useWagmiAccount } from "wagmi";
import { useMud } from "../context/MudContext";

export function useAccount() {
  const { address } = useWagmiAccount();
  const { defaultWalletAddress } = useMud();

  if (defaultWalletAddress) {
    return { address: defaultWalletAddress };
  } else if (address) {
    return { address };
  } else {
    throw new Error("No account found");
  }
}
