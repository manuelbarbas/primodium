import { garnet, MUDChain, mudFoundry, redstone } from "@latticexyz/common/chains";

const dev: ChainConfig = {
  ...mudFoundry,
  //COMMENT OUT INDEXER URL TO USE ONLY RPC
  indexerUrl: "http://localhost:3001",
};

const caldera: ChainConfig = {
  name: "Caldera",
  id: 12523,
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://primodium-bedrock.calderachain.xyz/replica-http"],
      // webSocket: ["wss://primodium-bedrock.calderachain.xyz/replica-ws"],
    },
    public: {
      http: ["https://primodium-bedrock.calderachain.xyz/replica-http"],
      // webSocket: ["wss://primodium-bedrock.calderachain.xyz/replica-ws"],
    },
  },
  faucetUrl: "https://caldera-faucet.primodium.ai/trpc",
  indexerUrl: "https://caldera-mud2-indexer.primodium.ai/trpc",
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://primodium-bedrock.calderaexplorer.xyz/",
    },
  },
};

const calderaSepolia: ChainConfig = {
  name: "Caldera Sepolia",
  id: 10017,
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://primodium-sepolia.rpc.caldera.xyz/http"],
    },
    public: {
      http: ["https://primodium-sepolia.rpc.caldera.xyz/http"],
    },
  },
  faucetUrl: "https://caldera-sepolia-faucet.primodium.ai/trpc",
  indexerUrl: "https://indexer-v0-11-1.primodium.ai",
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://primodium-sepolia.explorer.caldera.xyz/",
    },
  },
};

const baseSepolia: ChainConfig = {
  name: "Base Sepolia",
  id: 84532,
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
    public: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
};

const skaleBite: ChainConfig = {
  name: "SKALE BITE",
  id: 1289306510,
  nativeCurrency: { decimals: 18, name: "BITE", symbol: "BITE" },
  rpcUrls: {
    default: {
      http: ["https://testnet-v1.skalenodes.com/v1/warm-huge-striped-skale"],
    },
    public: {
      http: ["https://testnet-v1.skalenodes.com/v1/warm-huge-striped-skale"],
    },
  },
  blockExplorers: {
    default: {
      name: "BITE Hub explorer",
      url: "https://warm-huge-striped-skale.explorer.testnet-v1.skalenodes.com:10001/",
    },
  },
};

const skaleNebula: ChainConfig = {
  name: "SKALE Nebula",
  id: 37084624,
  nativeCurrency: { decimals: 18, name: "SKALE Fuel", symbol: "sFUEL" },
  rpcUrls: {
    default: {
      http: ["https://lanky-ill-funny-testnet-indexer.skalenodes.com:10136"],
    },
    public: {
      http: ["https://lanky-ill-funny-testnet-indexer.skalenodes.com:10136"],
    },
    proxy: {
      http: ["https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet"],
    },
  },
  //  indexerUrl: "https://lanky-ill-funny-testnet-indexer.skalenodes.com:10136",
  blockExplorers: {
    default: {
      name: "Nebula Gaming Hub explorer",
      url: "https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com/",
    },
  },
};

const skaleCalypso: ChainConfig = {
  name: "SKALE Calypso",
  id: 974399131,
  nativeCurrency: { decimals: 18, name: "SKALE Fuel", symbol: "sFUEL" },
  rpcUrls: {
    default: {
      http: ["https://giant-half-dual-testnet-indexer.skalenodes.com:10072"],
    },
    public: {
      http: ["https://giant-half-dual-testnet-indexer.skalenodes.com:10072"],
    },
    archive: {
      http: ["https://giant-half-dual-testnet-indexer.skalenodes.com:10072"],
    },
  },
  //  indexerUrl: "https://lanky-ill-funny-testnet-indexer.skalenodes.com:10136",
  blockExplorers: {
    default: {
      name: "Calypso Hub explorer",
      url: "https://https://giant-half-dual-testnet.explorer.testnet.skalenodes.com/",
    },
  },
};

const skaleEuropa: ChainConfig = {
  name: "SKALE Europa",
  id: 1444673419,
  nativeCurrency: { decimals: 18, name: "SKALE Fuel", symbol: "sFUEL" },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/juicy-low-small-testnet"],
    },
    public: {
      http: ["https://testnet.skalenodes.com/v1/juicy-low-small-testnet"],
    },
  },
  //  indexerUrl: "https://lanky-ill-funny-testnet-indexer.skalenodes.com:10136",
  blockExplorers: {
    default: {
      name: "Europa Hub explorer",
      url: "https://juicy-low-small-testnet.explorer.testnet.skalenodes.com/",
    },
  },
};

export type ChainConfig = MUDChain & { indexerUrl?: string };

export const chainConfigs = {
  baseSepolia,
  caldera,
  calderaSepolia,
  dev,
  garnet: garnet as ChainConfig,
  redstone: redstone as ChainConfig,
  skaleNebula,
  skaleCalypso,
  skaleEuropa,
  skaleBite,
} as const;
