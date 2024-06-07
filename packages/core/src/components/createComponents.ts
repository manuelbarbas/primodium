import setupCoreComponents from "@/components/coreComponents";
import { CreateNetworkResult } from "@/lib/types";

export let components: ReturnType<typeof _createComponents>;

/**
 * Creates the components object which contains all the components for the client
 * @dev Doesn't create the components if they already exist
 * @param network - The network object
 * @returns The components object
 */
export function createComponents(network: CreateNetworkResult) {
  if (components) return components;
  return _createComponents(network);
}

function _createComponents(network: CreateNetworkResult) {
  const coreComponents = setupCoreComponents(network);

  const comps = {
    ...network.components,
    ...coreComponents,
  };
  components = comps;
  return comps;
}
