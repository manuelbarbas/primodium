import { createComponents } from "./components/createComponents";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { setup } from "./setup";
import { setupNetwork } from "./setupNetwork";

export type NetworkConfig = ReturnType<typeof getNetworkConfig>;

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export type Components = ReturnType<typeof createComponents>;

export type SetupResult = Awaited<ReturnType<typeof setup>>;
