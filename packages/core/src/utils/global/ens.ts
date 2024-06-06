import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";
import { entityToAddress } from "@/utils/global/common";

export type LinkedAddressResult = {
  address: Hex | null;
  ensName: Hex | null;
};

// NOTE: This function will be replaced with account abstraction in a future update.

const addressMap = new Map<string, LinkedAddressResult>();
export const getEnsName = async (
  accountLinkUrl: string,
  playerEntity: Entity,
  hard?: boolean
): Promise<LinkedAddressResult> => {
  const address = entityToAddress(playerEntity);
  const retrievedData = addressMap.get(address);
  if (!hard && retrievedData) {
    return retrievedData;
  }

  try {
    const res = await fetch(`${accountLinkUrl}/ens/by-address/${address}`);
    const jsonRes = await res.json();
    addressMap.set(address, jsonRes as LinkedAddressResult);
    return jsonRes as LinkedAddressResult;
  } catch (error) {
    return { address: null, ensName: null } as LinkedAddressResult;
  }
};

export const removeLinkedAddress = (address: Hex) => {
  addressMap.delete(address);
};
