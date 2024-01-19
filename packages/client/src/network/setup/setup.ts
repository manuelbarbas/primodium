import { createComponents } from "../components";
import { setupInitialSync } from "./setupInitialSync";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const network = await setupNetwork();
  const components = createComponents(network);
  const setupResult = {
    network,
    components,
  };

  setupInitialSync(setupResult);

  return setupResult;
}
