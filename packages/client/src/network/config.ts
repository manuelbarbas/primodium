import { ExternalProvider } from "@ethersproject/providers";

import { SetupContractConfig } from "@latticexyz/std-client";
import { Wallet } from "ethers";
const params = new URLSearchParams(window.location.search);

export const devConfig = () => {
  const randomWallet = Wallet.createRandom();
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
    privateKey: randomWallet.privateKey,
    chainId: Number(params.get("chainId")) || 31337,
    snapshotServiceUrl: params.get("snapshot") ?? undefined,
    initialBlockNumber: Number(params.get("initialBlockNumber")) || 0,
    worldAddress: params.get("worldAddress")!,
    devMode: params.get("dev") === "true",
  };
  return { defaultWalletAddress: randomWallet.address, config: config };
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
  return { defaultWalletAddress: undefined, config: config };
};

// from opcraft, for deploying on mud testnet
export const defaultParams = {
  chainId: "4242",
  worldAddress: "0xc1c15CCE34E16684d36B0F76B9fa4f74b3a279f4",
  rpc: "https://follower.testnet-chain.linfra.xyz",
  wsRpc: "wss://follower.testnet-chain.linfra.xyz",
  initialBlockNumber: "1443526",
  snapshot: "https://ecs-snapshot.testnet-mud-services.linfra.xyz",
  stream: "https://ecs-stream.testnet-mud-services.linfra.xyz",
  relay: "https://ecs-relay.testnet-mud-services.linfra.xyz",
  faucet: "https://faucet.testnet-mud-services.linfra.xyz",
  blockTime: "1000",
  blockExplorer: "https://explorer.testnet-chain.linfra.xyz",
  dev: "false",
};
