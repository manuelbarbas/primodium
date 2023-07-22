import { ExternalProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";
import { isAddress } from "ethers/lib/utils.js";
import { NetworkConfig } from "src/util/types";
import { Address } from "wagmi";
import { chainConfigs } from "./chainConfigs";
const params = new URLSearchParams(window.location.search);

// The default production testnet is `skystrife`.
// All valid options are `lattice`, `caldera`, and `skystrife`.

// If VITE_DEV is true:
// - localhost options are used as described below.
// - Options provided as specific query params are prioritized over `defaultChain`.

const DEV = import.meta.env.VITE_DEV === "true";

const chain = params.get("defaultChain");

// TO UPDATE DEFAULT CHAIN, CHANGE THESE VALUES
const defaultDevChain = chainConfigs["local"];
const defaultProdChain = chainConfigs["skystrife"];
const defaultChain = DEV ? defaultDevChain : defaultProdChain;

const chainConfig = chain ? chainConfigs[chain] : defaultChain;

export const getNetworkLayerConfig = (
  externalProvider?: ExternalProvider
): NetworkConfig => {
  let address: Address | undefined = undefined;
  let privateKey: string | undefined = undefined;
  if (!externalProvider) {
    address = localStorage.getItem("address") as Address;
    if (address && !isAddress(address))
      throw new Error("Provided address incorrectly formatted");
    privateKey = localStorage.getItem("privateKey") ?? undefined;

    if (!address || !privateKey) {
      const randomWallet = Wallet.createRandom();
      address = randomWallet.address as Address;
      privateKey = randomWallet.privateKey;
      localStorage.setItem("address", randomWallet.address);
      localStorage.setItem("privateKey", randomWallet.privateKey);
    }
  }

  const worldAddress = params.get("worldAddress");
  if (!worldAddress) throw new Error("No world address provided");

  const rawChainId = params.get("chainId");
  const chainId = rawChainId ? Number(rawChainId) : chainConfig.chainId;

  const clock = {
    period: 1000,
    initialTime: 0,
    syncInterval: DEV ? 5000 : 60_000,
  };

  return {
    clock,
    provider: {
      jsonRpcUrl: params.get("rpc") ?? chainConfig.jsonRpcUrl,
      wsRpcUrl: params.get("wsRpc") ?? chainConfig.wsRpcUrl,
      chainId,
      externalProvider: externalProvider,
    },
    chainId,
    snapshotServiceUrl:
      params.get("snapshot") ?? chainConfig.snapshotServiceUrl,
    initialBlockNumber:
      Number(params.get("initialBlockNumber")) ??
      chainConfig.initialBlockNumber,
    worldAddress,
    devMode: DEV && params.get("dev") === "true",
    faucetUrl: params.get("faucetUrl") || chainConfig.tempFaucetUrl,
    privateKey,
    defaultWalletAddress: address,
    faucetMinDripAmount: chainConfig.tempFaucetMinDripAmount,
    encoders: DEV,
  };
};
