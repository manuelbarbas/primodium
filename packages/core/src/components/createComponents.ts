import setupClientComponents from "@/components/clientComponents";
import { extendContractComponents } from "@/components/customComponents/extendComponents";
import { CreateNetworkResult } from "@/types";

export let components: Components;

type Components = ReturnType<typeof _createComponents>;

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
  const contractComponents = extendContractComponents(network.components);
  const clientComponents = setupClientComponents(network);

  const comps = {
    ...contractComponents,
    ...clientComponents,
  };
  components = comps;
  return comps;
}
