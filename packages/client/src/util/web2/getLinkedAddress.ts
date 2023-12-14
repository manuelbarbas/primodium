import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export type LinkedAddressResult = {
  address: Hex | null;
  ensName: Hex | null;
};

// NOTE: This function will be replaced with account abstraction in a future update.

const addressMap = new Map<string, LinkedAddressResult>();
export const getLinkedAddress = async (
  address?: Hex,
  hard?: boolean,
  fetchEnsName?: boolean
): Promise<LinkedAddressResult> => {
  if (!address) {
    // Fetch linked address from server using the local browser wallet address
    const networkConfig = getNetworkConfig();
    const wallet = privateKeyToAccount(networkConfig.privateKey);
    address = wallet.address;
  }
  const localAddress = address;

  if (!hard && addressMap.has(localAddress)) {
    return addressMap.get(localAddress)!;
  }

  try {
    const res = await fetch(
      `${
        import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL
      }/linked-address/local-to-external/${localAddress}?ensName=${fetchEnsName}`
    );
    const jsonRes = await res.json();
    addressMap.set(localAddress, jsonRes as LinkedAddressResult);
    return jsonRes as LinkedAddressResult;
  } catch (error) {
    return { address: null, ensName: null } as LinkedAddressResult;
  }
};

export const removeLinkedAddress = (address: Hex) => {
  addressMap.delete(address);
};
