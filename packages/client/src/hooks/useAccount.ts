import { Address, useAccount as useWagmiAccount } from "wagmi";
import { EntityID } from "@latticexyz/recs";
import { useMud } from "./useMud";

export function useAccount(): {
  rawAddress: Address;
  address: EntityID;
  external: boolean;
} {
  const { address } = useWagmiAccount();
  const { defaultWalletAddress } = useMud();

  if (address) {
    return {
      rawAddress: address,
      address: address.toString().toLowerCase() as EntityID,
      external: true,
    };
  } else if (defaultWalletAddress) {
    return {
      rawAddress: defaultWalletAddress,
      address: defaultWalletAddress.toString().toLowerCase() as EntityID,
      external: false,
    };
  } else {
    throw new Error("No account found");
  }
}
