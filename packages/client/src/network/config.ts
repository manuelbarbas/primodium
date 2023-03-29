import { ExternalProvider } from "@ethersproject/providers";

import { SetupContractConfig } from "@latticexyz/std-client";
import { Wallet } from "ethers";
const params = new URLSearchParams(window.location.search);

export const devConfig = () => {
  const randomWalletKey = Wallet.createRandom().privateKey;
  console.log("randomWalletKey", randomWalletKey);
  const config: SetupContractConfig = {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      jsonRpcUrl: params.get("rpc") ?? "http://localhost:8545",
      wsRpcUrl: params.get("wsRpc") ?? "ws://localhost:8545",
      chainId: Number(params.get("chainId")) || 31337,
    },
    privateKey: randomWalletKey,
    chainId: Number(params.get("chainId")) || 31337,
    snapshotServiceUrl: params.get("snapshot") ?? undefined,
    initialBlockNumber: Number(params.get("initialBlockNumber")) || 0,
    worldAddress: params.get("worldAddress")!,
    devMode: params.get("dev") === "true",
  };
  return config;
};

export const getNetworkLayerConfig = (
  externalProvider: ExternalProvider | undefined
) => {
  const config: SetupContractConfig = {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      jsonRpcUrl: params.get("rpc") ?? "http://localhost:8545",
      wsRpcUrl: params.get("wsRpc") ?? "ws://localhost:8545",
      chainId: Number(params.get("chainId")) || 31337,
      externalProvider: externalProvider,
    },
    chainId: Number(params.get("chainId")) || 31337,
    snapshotServiceUrl: params.get("snapshot") ?? undefined,
    initialBlockNumber: Number(params.get("initialBlockNumber")) || 0,
    worldAddress: params.get("worldAddress")!,
    devMode: params.get("dev") === "true",
  };
  return config;
};
