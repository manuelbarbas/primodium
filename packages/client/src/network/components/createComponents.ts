import { SetupNetworkResult } from "../types";
import { world } from "../world";
import { createExtendedNumberComponent } from "./customComponents/ExtendedComponent";
import { extendComponents } from "./customComponents/extendComponents";

export const DoubleCounter = createExtendedNumberComponent(world);
export function createComponents({ components }: SetupNetworkResult) {
  const contractComponents = extendComponents(components);
  return {
    ...contractComponents,
    DoubleCounter,
    // add your client components or overrides here
  };
}
