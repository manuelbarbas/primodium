import {
  MUDChain,
  latticeTestnet,
  mudFoundry,
} from "@latticexyz/common/chains";

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
  // TODO @emersonhsieh fill this out
  // blockExplorers: {
  //   otterscan: {
  //     name: "Otterscan",
  //     url: "https://explorer.testnet-chain.linfra.xyz",
  //   },
  //   default: {
  //     name: "Otterscan",
  //     url: "https://explorer.testnet-chain.linfra.xyz",
  //   },
  // },
} as const satisfies MUDChain;

interface ChainConfigs {
  [x: string]: MUDChain;
}

export const chainConfigs: ChainConfigs = {
  latticeTestnet,
  caldera,
  dev: mudFoundry,
};
