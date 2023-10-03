import clientComponents from "./components/clientComponents";
import { extendContractComponents } from "./components/customComponents/extendComponents";
import { SetupNetworkResult } from "./types";

export let components: Components;

type Components = ReturnType<typeof createComponents>;

export function createComponents({ components: rawContractComponents }: SetupNetworkResult) {
  const contractComponents = extendContractComponents(rawContractComponents);

  const comps = {
    ...contractComponents,
    ...clientComponents,
    // add your client components or overrides here
  };
  components = comps;
  return comps;
}
