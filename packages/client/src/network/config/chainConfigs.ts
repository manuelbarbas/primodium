import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

export const caldera = {
  name: "Caldera",
  id: 12543,
  network: "caldera",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://primodium-bedrock.calderachain.xyz/replica-http"],
      webSocket: ["wss://primodium-bedrock.calderachain.xyz/replica-ws"],
    },
    public: {
      http: ["https://primodium-bedrock.calderachain.xyz/replica-http"],
      webSocket: ["wss://primodium-bedrock.calderachain.xyz/replica-ws"],
    },
  },
  faucetUrl: "https://primodium-services.caldera.gg/faucet",
  indexerUrl: "https://primodium-services.caldera.gg/trpc",
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://primodium-bedrock.calderaexplorer.xyz/",
    },
  },
};

interface ChainConfigs {
  [x: string]: MUDChain & { indexerUrl?: string };
}

export const chainConfigs: ChainConfigs = {
  latticeTestnet,
  caldera,
  dev: mudFoundry,
};
