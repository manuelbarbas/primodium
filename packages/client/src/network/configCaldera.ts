import { ExternalProvider } from "@ethersproject/providers";

import { SetupContractConfig } from "@latticexyz/std-client";
import { Wallet } from "ethers";
const params = new URLSearchParams(window.location.search);

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

// from skystrife

export const defaultParamsSkyStrife = {
  chainId: 4242,
  blockTime: 1,
  chainGasLimit: 100000000,
  rpc: "https://miner.skystrife-chain.linfra.xyz",
  wsRpc: "wss://follower.skystrife-chain.linfra.xyz",
  faucet: "https://faucet.skystrife-mud-services.linfra.xyz",
  snapshot: "https://ecs-snapshot.skystrife-mud-services.linfra.xyz",
  dev: "false",
};

export const faucetUrl = "https://primodium-services.caldera.gg/faucet";

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
        jsonRpcUrl: "https://primodium-testnet.calderachain.xyz/http",
        wsRpcUrl: "wss://primodium-testnet.calderachain.xyz/ws",
        chainId: 5011708,
      },
      chainId: 5011708,
      snapshotServiceUrl: "https://primodium-services.caldera.gg/ecs-snapshot",
      initialBlockNumber: 0,
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
        jsonRpcUrl: "https://primodium-testnet.calderachain.xyz/http",
        wsRpcUrl: "wss://primodium-testnet.calderachain.xyz/ws",
        chainId: 5011708,
        externalProvider: externalProvider,
      },
      chainId: 5011708,
      snapshotServiceUrl: "https://primodium-services.caldera.gg/ecs-snapshot",
      initialBlockNumber: 0,
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
