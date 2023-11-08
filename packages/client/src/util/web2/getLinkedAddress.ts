import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export type LinkedAddressResult = {
  address: Hex | null;
  ensName: Hex | null;
};

// NOTE: This function will be replaced with account abstraction in a future update.
export const getLinkedAddress = async (address?: Hex): Promise<LinkedAddressResult> => {
  let localAddress = address;
  if (!address) {
    // Fetch linked address from server using the local browser wallet address
    const networkConfig = getNetworkConfig();
    const wallet = privateKeyToAccount(networkConfig.privateKey);
    localAddress = wallet.address;
  }

  try {
    const res = await fetch(
      `${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/linked-address/local-to-external/${localAddress}`
    );
    const jsonRes = await res.json();
    return jsonRes as LinkedAddressResult;
  } catch (error) {
    return { address: null, ensName: null } as LinkedAddressResult;
  }
};
