type ChainConfig = {
  jsonRpcUrl: string;
  wsRpcUrl: string;
  tempFaucetUrl?: string;
  snapshotServiceUrl?: string;
  chainId: number;
  initialBlockNumber: number;
  tempFaucetMinDripAmount?: number;
};
const lattice: ChainConfig = {
  // from lattice
  jsonRpcUrl: "https://follower.testnet-chain.linfra.xyz",
  wsRpcUrl: "wss://follower.testnet-chain.linfra.xyz",
  tempFaucetUrl: "https://faucet.testnet-mud-services$linfra.xyz",
  snapshotServiceUrl: "https://ecs-snapshot.testnet-mud-services.linfra.xyz",
  chainId: 4242,
  initialBlockNumber: 1443526,
  tempFaucetMinDripAmount: 2,
};

const caldera: ChainConfig = {
  // from caldera
  jsonRpcUrl: "https://primodium-bedrock.calderachain.xyz/replica-http",
  wsRpcUrl: "wss://primodium-bedrock.calderachain.xyz/replica-ws",
  tempFaucetUrl: "https://primodium-services.caldera.gg/faucet",
  snapshotServiceUrl: "https://primodium-services.caldera.gg/ecs-snapshot",
  chainId: 12523,
  initialBlockNumber: 29367,
  tempFaucetMinDripAmount: 0.003,
};

const skystrife: ChainConfig = {
  // from skystrife
  jsonRpcUrl: "https://miner.skystrife-chain.linfra.xyz",
  wsRpcUrl: "wss://follower.skystrife-chain.linfra.xyz",
  tempFaucetUrl: "https://faucet.skystrife-mud-services.linfra.xyz",
  snapshotServiceUrl: "https://ecs-snapshot.skystrife-mud-services.linfra.xyz",
  chainId: 4242,
  initialBlockNumber: 10139750,
  tempFaucetMinDripAmount: 2,
};

const local: ChainConfig = {
  jsonRpcUrl: "http://localhost:8545",
  wsRpcUrl: "ws://localhost:8545",
  chainId: 31337,
  initialBlockNumber: 0,
};

export interface ChainConfigs {
  [x: string]: ChainConfig;
}

export const chainConfigs: ChainConfigs = {
  lattice,
  caldera,
  skystrife,
  local,
};
