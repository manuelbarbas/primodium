import worldsJson from "contracts/worlds.json";
import { chainConfigs } from "./chainConfigs";
import { NetworkConfig } from "@/lib/types";

const worlds = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

export const getNetworkConfig = (options?: {
  chainId?: string;
  faucetUrl?: string;
  worldAddress?: string;
  initialBlockNumber?: number;
}): NetworkConfig => {
  // Ignore deployment URL params on production subdomains (primodium.com)
  const isNode = typeof process !== "undefined";
  const params = isNode
    ? undefined
    : window.location.hostname.endsWith("primodium.com")
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);

  const chainId =
    options?.chainId ||
    params?.get("chainid") ||
    (isNode ? process.env.PRI_CHAIN_ID : (import.meta as any).env.PRI_CHAIN_ID) ||
    "dev";

  const chain = chainConfigs[chainId];

  const world = worlds[chain.id];
  const worldAddress = options?.worldAddress || params?.get("worldAddress") || world?.address;
  if (!worldAddress) {
    throw new Error(`No world address found for chain ${chainId}. `);
  }
  const initialBlockNumber =
    options?.initialBlockNumber ?? params?.has("initialBlockNumber")
      ? Number(params?.get("initialBlockNumber"))
      : world?.blockNumber ?? 0;

  return {
    chainId,
    chain,
    faucetServiceUrl: options?.faucetUrl ?? params?.get("faucet") ?? chain.faucetUrl,
    worldAddress,
    initialBlockNumber: BigInt(initialBlockNumber),
    indexerUrl: chain.indexerUrl,
  };
};
