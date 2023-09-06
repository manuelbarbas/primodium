import { createComponents } from "./components/createComponents";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { createSystems } from "./createSystems";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const network = await setupNetwork(getNetworkConfig());
  const components = createComponents(network);
  const systems = createSystems(network, components);
  return {
    network,
    components,
    systems,
  };
}
