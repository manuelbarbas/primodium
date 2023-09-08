import { SetupNetworkResult } from "../types";
import clientComponents from "./clientComponents";
import { extendComponents } from "./customComponents/extendComponents";

export function createComponents({ components }: SetupNetworkResult) {
  const contractComponents = extendComponents(components);
  return {
    ...contractComponents,
    ...clientComponents,
    // add your client components or overrides here
  };
}
