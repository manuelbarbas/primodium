import { Address, useAccount as useWagmiAccount } from "wagmi";
import { useMud } from "../context/MudContext";
import { EntityID } from "@latticexyz/recs";

export function useAccount(): { rawAddress: Address; address: EntityID } {
  const { address } = useWagmiAccount();
  const { defaultWalletAddress } = useMud();

  if (defaultWalletAddress) {
    return {
      rawAddress: defaultWalletAddress,
      address: defaultWalletAddress.toString().toLowerCase() as EntityID,
    };
  } else if (address) {
    return {
      rawAddress: address,
      address: address.toString().toLowerCase() as EntityID,
    };
  } else {
    throw new Error("No account found");
  }
}
