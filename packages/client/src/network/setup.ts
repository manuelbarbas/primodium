import { Hex } from "viem";
import { createComponents } from "./components";
import { createContractCalls } from "./createContractCalls";
import { setupNetwork } from "./setupNetwork";

export async function setup(externalAddress?: Hex) {
  const network = await setupNetwork(externalAddress);
  const components = createComponents(network);
  const contractCalls = createContractCalls(network, components);
  return {
    network,
    components,
    contractCalls,
  };
}
