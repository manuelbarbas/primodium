import { useMud } from "src/context/MudContext";
import { useAccount as useWagmiAccount } from "wagmi";

export function useAccount() {
  const { address } = useWagmiAccount();
  const { defaultWalletAddress } = useMud();
  if (!defaultWalletAddress && !address) throw new Error("No account found");
  return { address: defaultWalletAddress ?? address };
}
