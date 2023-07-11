import { ExternalProvider } from "@ethersproject/providers";

import { SetupContractConfig } from "@latticexyz/std-client";
import { Wallet } from "ethers";
const params = new URLSearchParams(window.location.search);

// The default production testnet is `skystrife`.
// All valid options are `lattice`, `caldera`, and `skystrife.

// If VITE_DEV is true:
// - localhost options are used as described below.
// - Options provided as specific query params are prioritized over `defaultChain`.

let jsonRpcUrl: string;
let wsRpcUrl: string;
let tempFaucetUrl: string;
let snapshotServiceUrl: string;
let chainId: number;
let initialBlockNumber: number;

if (params.get("defaultChain") === "lattice") {
  // from lattice
  jsonRpcUrl = "https://follower.testnet-chain.linfra.xyz";
  wsRpcUrl = "wss://follower.testnet-chain.linfra.xyz";
  tempFaucetUrl = "https://faucet.testnet-mud-services.linfra.xyz";
  snapshotServiceUrl = "https://ecs-snapshot.testnet-mud-services.linfra.xyz";
  chainId = 4242;
  initialBlockNumber = 1443526;
} else if (params.get("defaultChain") === "caldera") {
  // from caldera
  jsonRpcUrl = "https://primodium-bedrock.calderachain.xyz/http";
  wsRpcUrl = "wss://primodium-bedrock.calderachain.xyz/ws";
  tempFaucetUrl = "https://primodium-services.caldera.gg/faucet";
  snapshotServiceUrl = "https://primodium-services.caldera.gg/ecs-snapshot";
  chainId = 12523;
  initialBlockNumber = 29367;
} else {
  // from skystrife
  jsonRpcUrl = "https://miner.skystrife-chain.linfra.xyz";
  wsRpcUrl = "wss://follower.skystrife-chain.linfra.xyz";
  tempFaucetUrl = "https://faucet.skystrife-mud-services.linfra.xyz";
  snapshotServiceUrl = "https://ecs-snapshot.skystrife-mud-services.linfra.xyz";
  chainId = 4242;
  initialBlockNumber = 10139750;
}

export const faucetUrl = tempFaucetUrl;

// change flag before deployment
const DEV = import.meta.env.VITE_DEV === "true";

export const devConfig = () => {
  let address = localStorage.getItem("address");
  let privateKey = localStorage.getItem("privateKey");

  if (!address || !privateKey) {
    const randomWallet = Wallet.createRandom();
    address = randomWallet.address;
    privateKey = randomWallet.privateKey;
    localStorage.setItem("address", randomWallet.address);
    localStorage.setItem("privateKey", randomWallet.privateKey);
  }

  if (!DEV) {
    const config: SetupContractConfig = {
      clock: {
        period: 1000,
        initialTime: 0,
        syncInterval: 60_000,
      },
      provider: {
        jsonRpcUrl: jsonRpcUrl,
        wsRpcUrl: wsRpcUrl,
        chainId: chainId,
      },
      chainId: chainId,
      snapshotServiceUrl: snapshotServiceUrl,
      initialBlockNumber: initialBlockNumber,
      worldAddress: params.get("worldAddress")!,
      devMode: false,
      privateKey: privateKey,
    };
    return { defaultWalletAddress: address, config: config };
  } else {
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
      chainId: Number(params.get("chainId")) || 31337,
      snapshotServiceUrl: params.get("snapshot") ?? undefined,
      initialBlockNumber: Number(params.get("initialBlockNumber")) || 0,
      worldAddress: params.get("worldAddress")!,
      devMode: params.get("dev") === "true",
      privateKey: privateKey,
    };
    return { defaultWalletAddress: address, config: config };
  }
};

export const getNetworkLayerConfig = (
  externalProvider: ExternalProvider | undefined
) => {
  if (!DEV) {
    const config: SetupContractConfig = {
      clock: {
        period: 1000,
        initialTime: 0,
        syncInterval: 60_000,
      },
      provider: {
        jsonRpcUrl: jsonRpcUrl,
        wsRpcUrl: wsRpcUrl,
        chainId: chainId,
        externalProvider: externalProvider,
      },
      chainId: chainId,
      snapshotServiceUrl: snapshotServiceUrl,
      initialBlockNumber: initialBlockNumber,
      worldAddress: params.get("worldAddress")!,
      devMode: false,
    };
    return { defaultWalletAddress: undefined, config: config };
  } else {
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
  }
};
