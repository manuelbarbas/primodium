import { SetupNetworkResult } from "../types";
import clientComponents from "./clientComponents";
import { extendComponents } from "./customComponents/extendComponents";

let components: Components | undefined = undefined;

export function getComponents(): Components {
  if (!components) throw new Error("Components not initialized");
  return components;
}
type Components = ReturnType<typeof createComponents>;

export function createComponents({ components: rawContractComponents }: SetupNetworkResult) {
  const contractComponents = extendComponents(rawContractComponents);

  const comps = {
    ...contractComponents,
    ...clientComponents,
    // add your client components or overrides here
  };
  components = comps;
  return comps;
}
