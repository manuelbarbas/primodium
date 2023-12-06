import { createComponents } from "./components";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { createContractCalls } from "./createContractCalls";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const network = await setupNetwork(getNetworkConfig());
  const components = createComponents(network);
  const contractCalls = createContractCalls(network, components);
  return {
    network,
    components,
    contractCalls,
  };
}
