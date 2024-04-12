import { createComponents } from "../components";
import { createNetwork, network } from "./createNetwork";
import { setupInitialSync } from "./setupInitialSync";

export async function setup() {
  const hot = network !== undefined;
  const networkResult = createNetwork();
  // if components already exists then this is a hot reload and they have been built already
  const comps = createComponents(networkResult);
  const setupResult = {
    network: networkResult,
    components: comps,
  };

  if (!hot) setupInitialSync(setupResult);

  return setupResult;
}
