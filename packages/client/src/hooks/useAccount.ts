import { Address, useAccount as useWagmiAccount } from "wagmi";
import { EntityID } from "@latticexyz/recs";
import { useMud } from "./useMud";

export function useAccount(): {
  rawAddress: Address;
  address: EntityID;
} {
  const { address } = useWagmiAccount();
  const { defaultWalletAddress } = useMud();

  if (address) {
    return {
      rawAddress: address,
      address: address.toString().toLowerCase() as EntityID,
    };
  } else if (defaultWalletAddress) {
    return {
      rawAddress: defaultWalletAddress,
      address: defaultWalletAddress.toString().toLowerCase() as EntityID,
    };
  } else {
    throw new Error("No account found");
  }
}
