import { createComponents } from "../components";
import createContractCalls from "./contractCalls";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const network = await setupNetwork();
  const components = createComponents(network);
  const contractCalls = createContractCalls(network);
  return {
    network,
    components,
    contractCalls,
  };
}
