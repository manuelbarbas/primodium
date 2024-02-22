import { createComponents } from "../components";
import { createNetwork } from "./createNetwork";
import { setupInitialSync } from "./setupInitialSync";

export async function setup() {
  const network = await createNetwork();
  const components = createComponents(network);
  const setupResult = {
    network,
    components,
  };

  setupInitialSync(setupResult);

  return setupResult;
}
