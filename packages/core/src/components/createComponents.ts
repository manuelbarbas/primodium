import setupCoreComponents from "@/components/coreComponents";
import { Components, CreateNetworkResult } from "@/lib/types";

export function createComponents(network: CreateNetworkResult): Components {
  const coreComponents = setupCoreComponents(network);

  return {
    ...network.components,
    ...coreComponents,
  };
}
