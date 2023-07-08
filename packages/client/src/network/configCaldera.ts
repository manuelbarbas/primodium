import { ExternalProvider } from "@ethersproject/providers";

import { SetupContractConfig } from "@latticexyz/std-client";
import { Wallet } from "ethers";
const params = new URLSearchParams(window.location.search);

// from caldera
export const jsonRpcUrl = "https://bubs.calderachain.xyz/replica-http";
export const wsRpcUrl = "wss://bubs.calderachain.xyz/replica-ws";
export const faucetUrl = "https://primodium-services.caldera.gg/faucet";
export const snapshotServiceUrl =
  "https://primodium-services.caldera.gg/ecs-snapshot";
export const chainId = 1582;
export const initialBlockNumber = 33740;

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
